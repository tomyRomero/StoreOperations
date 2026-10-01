using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminOrdersTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private const string TrackingNumber = "1Z999AA10123456784";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Orders_are_listed_newest_first_and_found_by_number_or_customer()
    {
        var admin = await api.CreateAdminClientAsync();
        var (older, olderNumber) = await PlacedOrderAsync();
        var (_, newerNumber) = await PlacedOrderAsync();

        var numbers = (await ListAsync(admin, "pageSize=100")).Select(o => o.GetProperty("orderNumber").GetString()).ToList();
        var byEmail = Assert.Single(await ListAsync(admin, $"search={Uri.EscapeDataString(older.Email)}"));
        var byNumber = Assert.Single(await ListAsync(admin, $"search={newerNumber.ToLowerInvariant()}"));

        Assert.Equal(new[] { newerNumber, olderNumber }, numbers.Where(n => n == newerNumber || n == olderNumber));
        Assert.Equal(olderNumber, byEmail.GetProperty("orderNumber").GetString());
        Assert.Equal(older.Email, byEmail.GetProperty("customerEmail").GetString());
        Assert.Equal(newerNumber, byNumber.GetProperty("orderNumber").GetString());
        // A paid order waiting to ship can be shipped, cancelled or refunded
        Assert.Equal(new[] { "shipped", "cancelled", "refunded" },
            byNumber.GetProperty("nextStatuses").EnumerateArray().Select(s => s.GetString()));
    }

    [Theory]
    [InlineData("sort=placed", "cheap", "dear")]
    [InlineData("sort=total", "cheap", "dear")]
    [InlineData("sort=total_desc", "dear", "cheap")]
    public async Task Orders_can_be_sorted_by_date_or_total(string query, string first, string second)
    {
        var admin = await api.CreateAdminClientAsync();
        var (_, cheap) = await PlacedOrderAsync(priceCents: 500);
        var (_, dear) = await PlacedOrderAsync(priceCents: 9000);
        var names = new Dictionary<string, string> { ["cheap"] = cheap, ["dear"] = dear };

        var numbers = (await ListAsync(admin, $"{query}&pageSize=100")).Select(o => o.GetProperty("orderNumber").GetString());

        Assert.Equal(new[] { names[first], names[second] }, numbers.Where(n => n == cheap || n == dear));
    }

    [Fact]
    public async Task The_order_page_shows_the_customer_the_payment_and_what_can_happen_next()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(priceCents: 1500, quantity: 2);

        var order = await GetAsync(admin, number);

        Assert.Equal("pending", order.GetProperty("status").GetString());
        Assert.Equal(new[] { "shipped", "cancelled", "refunded" }, StatusesOf(order.GetProperty("nextStatuses")));
        Assert.Equal(sale.Email, order.GetProperty("customerEmail").GetString());
        Assert.Equal(sale.Intent.Id, order.GetProperty("stripePaymentIntentId").GetString());
        var line = Assert.Single(order.GetProperty("lines").EnumerateArray());
        Assert.Equal(3000, line.GetProperty("lineTotalCents").GetInt32());
        // Placed by the webhook, so no admin is named
        var placed = Assert.Single(order.GetProperty("timeline").EnumerateArray());
        Assert.Equal(JsonValueKind.Null, placed.GetProperty("changedBy").ValueKind);
    }

    [Fact]
    public async Task Shipping_an_order_records_its_tracking_and_who_shipped_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var me = await admin.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);
        var (sale, number) = await PlacedOrderAsync();

        var response = await UpdateAsync(admin, number, await GetAsync(admin, number), "shipped",
            carrier: "ups", trackingNumber: $" {TrackingNumber} ", estimatedDeliveryDate: "2026-10-06");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var shipped = await BodyOf(response);
        Assert.Equal("shipped", shipped.GetProperty("status").GetString());
        Assert.Equal(new[] { "delivered", "cancelled", "refunded" }, StatusesOf(shipped.GetProperty("nextStatuses")));
        Assert.Equal(TrackingNumber, shipped.GetProperty("trackingNumber").GetString());
        Assert.Equal($"https://www.ups.com/track?tracknum={TrackingNumber}", shipped.GetProperty("trackingUrl").GetString());
        var step = shipped.GetProperty("timeline").EnumerateArray().Last();
        Assert.Equal("shipped", step.GetProperty("status").GetString());
        Assert.Equal(me.GetProperty("username").GetString(), step.GetProperty("changedBy").GetString());

        // The customer's order page follows
        var theirs = await sale.Customer.GetFromJsonAsync<JsonElement>($"/api/account/orders/{number}", Ct);
        Assert.Equal("shipped", theirs.GetProperty("status").GetString());
        Assert.Equal(TrackingNumber, theirs.GetProperty("trackingNumber").GetString());
        Assert.Equal("2026-10-06", theirs.GetProperty("estimatedDeliveryDate").GetString());

        // Recorded as the admin's doing, and the store's default is not to email the customer
        await using var db = api.CreateContext();
        var orderId = await db.Orders.Where(o => o.OrderNumber == number).Select(o => o.Id).SingleAsync(Ct);
        var entry = await db.ActivityLog.SingleAsync(e => e.Action == ActivityAction.OrderStatusChanged && e.EntityId == orderId, Ct);
        Assert.Equal(me.GetProperty("id").GetInt32(), entry.ActorUserId);
        Assert.False(await db.EmailOutbox.AnyAsync(m => m.ToAddress == sale.Email && m.Kind == EmailKind.OrderStatusUpdate, Ct));
    }

    [Fact]
    public async Task Tracking_can_be_corrected_without_changing_the_status()
    {
        var admin = await api.CreateAdminClientAsync();
        var (_, number) = await PlacedOrderAsync();
        var shipped = await BodyOf(await UpdateAsync(admin, number, await GetAsync(admin, number), "shipped", carrier: "ups", trackingNumber: "1Z-TYPO"));

        var response = await UpdateAsync(admin, number, shipped, "shipped", carrier: "ups", trackingNumber: TrackingNumber);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var corrected = await BodyOf(response);
        Assert.Equal(TrackingNumber, corrected.GetProperty("trackingNumber").GetString());
        Assert.Equal(2, corrected.GetProperty("timeline").GetArrayLength());
    }

    [Fact]
    public async Task The_customer_is_emailed_when_the_admin_asks()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync();

        await UpdateAsync(admin, number, await GetAsync(admin, number), "shipped",
            carrier: "ups", trackingNumber: TrackingNumber, emailCustomer: true);

        var email = Assert.Single(await StatusEmailsToAsync(sale.Email));
        Assert.Equal($"Your order is on its way ({number})", email.Subject);
        Assert.Contains(TrackingNumber, email.HtmlBody);
        Assert.Contains($"http://localhost:3200/account/orders/{number}", email.HtmlBody);
        Assert.Contains(TrackingNumber, email.TextBody);
    }

    [Fact]
    public async Task When_the_admin_does_not_say_the_stores_setting_decides()
    {
        await SetEmailByDefaultAsync(true);
        try
        {
            var admin = await api.CreateAdminClientAsync();
            var (followsDefault, first) = await PlacedOrderAsync();
            var (optedOut, second) = await PlacedOrderAsync();

            await UpdateAsync(admin, first, await GetAsync(admin, first), "cancelled", note: "Out of that colour, sorry.");
            await UpdateAsync(admin, second, await GetAsync(admin, second), "cancelled", emailCustomer: false);

            var email = Assert.Single(await StatusEmailsToAsync(followsDefault.Email));
            Assert.Contains("Out of that colour, sorry.", email.HtmlBody);
            Assert.Empty(await StatusEmailsToAsync(optedOut.Email));
        }
        finally
        {
            await SetEmailByDefaultAsync(false);
        }
    }

    [Fact]
    public async Task Cancelling_an_order_that_never_shipped_puts_its_stock_back()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);
        Assert.Equal(3, await StockOfAsync(sale.ProductId));

        var response = await UpdateAsync(admin, number, await GetAsync(admin, number), "cancelled", note: "Cancelled at your request.");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
        var theirs = await sale.Customer.GetFromJsonAsync<JsonElement>($"/api/account/orders/{number}", Ct);
        Assert.Equal("Cancelled at your request.", theirs.GetProperty("timeline").EnumerateArray().Last().GetProperty("note").GetString());
    }

    [Fact]
    public async Task An_order_that_already_shipped_does_not_come_back_into_stock()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);
        var shipped = await BodyOf(await UpdateAsync(admin, number, await GetAsync(admin, number), "shipped"));

        var response = await UpdateAsync(admin, number, shipped, "refunded");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(3, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task An_order_only_moves_on_to_one_of_its_next_steps()
    {
        var admin = await api.CreateAdminClientAsync();
        var (_, number) = await PlacedOrderAsync();
        var pending = await GetAsync(admin, number);

        var skipped = await UpdateAsync(admin, number, pending, "delivered");
        var cancelled = await BodyOf(await UpdateAsync(admin, number, pending, "cancelled"));
        var reopened = await UpdateAsync(admin, number, cancelled, "shipped");

        Assert.Equal(HttpStatusCode.BadRequest, skipped.StatusCode);
        Assert.True((await BodyOf(skipped)).GetProperty("errors").TryGetProperty("status", out _));
        Assert.Empty(StatusesOf(cancelled.GetProperty("nextStatuses")));
        Assert.Equal(HttpStatusCode.BadRequest, reopened.StatusCode);
    }

    [Fact]
    public async Task An_edit_from_an_older_copy_is_refused_and_changes_nothing()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);
        var opened = await GetAsync(admin, number);
        await UpdateAsync(admin, number, opened, "cancelled");

        var stale = await UpdateAsync(admin, number, opened, "refunded");

        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("EDIT_CONFLICT", (await BodyOf(stale)).GetProperty("code").GetString());
        var order = await GetAsync(admin, number);
        Assert.Equal("cancelled", order.GetProperty("status").GetString());
        Assert.Equal(2, order.GetProperty("timeline").GetArrayLength());
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task Two_admins_cancelling_at_the_same_moment_put_the_stock_back_once()
    {
        var first = await api.CreateAdminClientAsync();
        var second = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);
        var opened = await GetAsync(first, number);

        var responses = await Task.WhenAll(
            UpdateAsync(first, number, opened, "cancelled"),
            UpdateAsync(second, number, opened, "cancelled"));

        Assert.Equal(
            new[] { HttpStatusCode.OK, HttpStatusCode.Conflict },
            responses.Select(r => r.StatusCode).Order());
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task Several_orders_move_on_at_once_and_each_follows_the_rules()
    {
        var admin = await api.CreateAdminClientAsync();
        var (_, first) = await PlacedOrderAsync();
        var (_, second) = await PlacedOrderAsync();
        var (_, cancelled) = await PlacedOrderAsync();
        await UpdateAsync(admin, cancelled, await GetAsync(admin, cancelled), "cancelled");

        var response = await admin.PostAsJsonAsync("/api/admin/orders/bulk-status",
            new { orderNumbers = new[] { first, second, cancelled, "ZZZZZZZZ" }, status = "shipped" }, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await BodyOf(response);
        Assert.Equal(new[] { first, second }, result.GetProperty("succeeded").EnumerateArray().Select(n => n.GetString()));
        var failed = result.GetProperty("failed").EnumerateArray().ToDictionary(f => f.GetProperty("id").GetString()!, f => f.GetProperty("code").GetString());
        Assert.Equal("STATUS_NOT_ALLOWED", failed[cancelled]);
        Assert.Equal("NOT_FOUND", failed["ZZZZZZZZ"]);
        Assert.Equal("shipped", (await GetAsync(admin, first)).GetProperty("status").GetString());
        Assert.Equal("cancelled", (await GetAsync(admin, cancelled)).GetProperty("status").GetString());
    }

    [Fact]
    public async Task Cancelling_in_bulk_puts_stock_back_as_one_at_a_time_does()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);

        var unconfirmed = await BodyOf(await admin.PostAsJsonAsync("/api/admin/orders/bulk-status",
            new { orderNumbers = new[] { number }, status = "cancelled" }, Ct));
        await admin.PostAsJsonAsync("/api/admin/orders/bulk-status",
            new { orderNumbers = new[] { number }, status = "cancelled", confirmRefund = true }, Ct);

        Assert.Equal("REFUND_NOT_CONFIRMED", unconfirmed.GetProperty("failed")[0].GetProperty("code").GetString());
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
        Assert.Contains(sale.Intent.Id, api.Payments.Refunds);
    }

    [Fact]
    public async Task Cancelling_refunds_the_payment_in_full_before_it_is_recorded()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync();

        var response = await UpdateAsync(admin, number, await GetAsync(admin, number), "cancelled");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(sale.Intent.Id, api.Payments.Refunds);
        // The sale's tax record is reversed too, so tax reports don't count it
        Assert.Contains(number, api.Payments.TaxReversedForOrders);
        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.OrderNumber == number, Ct);
        var entry = await db.ActivityLog.SingleAsync(e => e.Action == ActivityAction.OrderStatusChanged && e.EntityId == order.Id, Ct);
        Assert.Equal(order.TotalCents, JsonDocument.Parse(entry.DetailsJson!).RootElement.GetProperty("refundedCents").GetInt32());
    }

    [Fact]
    public async Task Money_never_moves_without_the_admins_confirmation()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync();

        var response = await UpdateAsync(admin, number, await GetAsync(admin, number), "refunded", confirmRefund: false);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("confirmRefund", out _));
        Assert.DoesNotContain(sale.Intent.Id, api.Payments.Refunds);
        Assert.Equal("pending", (await GetAsync(admin, number)).GetProperty("status").GetString());
    }

    [Fact]
    public async Task When_stripe_cannot_refund_nothing_changes_and_trying_again_works()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(quantity: 2, stock: 5);
        api.Payments.FailNextRefund();

        var failed = await UpdateAsync(admin, number, await GetAsync(admin, number), "cancelled");

        Assert.Equal(HttpStatusCode.BadGateway, failed.StatusCode);
        Assert.Equal("REFUND_FAILED", (await BodyOf(failed)).GetProperty("code").GetString());
        Assert.Equal("pending", (await GetAsync(admin, number)).GetProperty("status").GetString());
        Assert.Equal(3, await StockOfAsync(sale.ProductId));

        var retried = await UpdateAsync(admin, number, await GetAsync(admin, number), "cancelled");

        Assert.Equal(HttpStatusCode.OK, retried.StatusCode);
        Assert.Contains(sale.Intent.Id, api.Payments.Refunds);
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task The_customer_is_told_their_money_is_on_its_way()
    {
        var admin = await api.CreateAdminClientAsync();
        var (sale, number) = await PlacedOrderAsync(priceCents: 2000);
        var shipped = await BodyOf(await UpdateAsync(admin, number, await GetAsync(admin, number), "shipped"));

        await UpdateAsync(admin, number, shipped, "refunded", emailCustomer: true);

        var email = Assert.Single(await StatusEmailsToAsync(sale.Email));
        Assert.Equal($"Your order was refunded ({number})", email.Subject);
        Assert.Contains($"We refunded <strong>{Money.Format(shipped.GetProperty("totalCents").GetInt32())}</strong> to your card", email.HtmlBody);
    }

    [Fact]
    public async Task A_webhook_retried_after_a_cancellation_records_no_tax()
    {
        var admin = await api.CreateAdminClientAsync();
        var sale = await api.PaidCheckoutAsync();
        var payload = StripeEvents.PaymentSucceeded(sale.Intent);
        // The order is saved, but recording its tax fails, so Stripe will send the webhook again later
        api.Payments.FailNextTaxRecording();
        await StripeEvents.SendAsync(api.Factory.CreateClient(), payload);
        await using var db = api.CreateContext();
        var number = await db.Orders.Where(o => o.StripePaymentIntentId == sale.Intent.Id).Select(o => o.OrderNumber).SingleAsync(Ct);
        await UpdateAsync(admin, number, await GetAsync(admin, number), "cancelled");

        var retry = await StripeEvents.SendAsync(api.Factory.CreateClient(), payload);

        Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
        Assert.DoesNotContain(number, api.Payments.TaxRecordedForOrders);
        Assert.Equal("cancelled", (await GetAsync(admin, number)).GetProperty("status").GetString());
    }

    // Left out, the status would otherwise read as "pending" and the rest would be saved as if unchanged
    [Fact]
    public async Task An_update_without_a_status_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var (_, number) = await PlacedOrderAsync();
        var opened = await GetAsync(admin, number);

        var response = await admin.PutAsJsonAsync($"/api/admin/orders/{number}", new
        {
            trackingNumber = "1Z999AA10123456784",
            rowVersion = opened.GetProperty("rowVersion").GetString(),
        }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(JsonValueKind.Null, (await GetAsync(admin, number)).GetProperty("trackingNumber").ValueKind);
    }

    [Fact]
    public async Task An_unknown_order_is_not_found()
    {
        var admin = await api.CreateAdminClientAsync();
        var opened = await GetAsync(admin, (await PlacedOrderAsync()).Number);

        var get = await admin.GetAsync("/api/admin/orders/ZZZZZZZZ", Ct);
        var put = await UpdateAsync(admin, "ZZZZZZZZ", opened, "shipped");

        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, put.StatusCode);
    }

    // A customer's paid order, placed by Stripe's webhook
    private async Task<(Sale Sale, string Number)> PlacedOrderAsync(int priceCents = 1000, int quantity = 1, int stock = 10)
    {
        var sale = await api.PaidCheckoutAsync(priceCents: priceCents, quantity: quantity, stock: stock);
        await api.WebhookArrivesAsync(sale);
        await using var db = api.CreateContext();
        var number = await db.Orders.Where(o => o.StripePaymentIntentId == sale.Intent.Id).Select(o => o.OrderNumber).SingleAsync(Ct);
        return (sale, number);
    }

    private static async Task<List<JsonElement>> ListAsync(HttpClient admin, string query) =>
        (await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders?{query}", Ct)).GetProperty("items").EnumerateArray().ToList();

    private static Task<JsonElement> GetAsync(HttpClient admin, string number) =>
        admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders/{number}", Ct);

    // The side panel saved as the admin left it: the new status, the shipping details, and the version
    // they opened. The refund is confirmed, as the page's dialog does, unless a test says otherwise.
    private static Task<HttpResponseMessage> UpdateAsync(
        HttpClient admin, string number, JsonElement opened, string status, string? carrier = null,
        string? trackingNumber = null, string? estimatedDeliveryDate = null, string? note = null, bool? emailCustomer = null,
        bool confirmRefund = true) =>
        admin.PutAsJsonAsync($"/api/admin/orders/{number}", new
        {
            status,
            carrier,
            trackingNumber,
            estimatedDeliveryDate,
            note,
            emailCustomer,
            confirmRefund,
            rowVersion = opened.GetProperty("rowVersion").GetString(),
        }, Ct);

    private static string[] StatusesOf(JsonElement statuses) => statuses.EnumerateArray().Select(s => s.GetString()!).ToArray();

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);

    private async Task<List<EmailOutboxMessage>> StatusEmailsToAsync(string address)
    {
        await using var db = api.CreateContext();
        return await db.EmailOutbox.Where(m => m.ToAddress == address && m.Kind == EmailKind.OrderStatusUpdate).ToListAsync(Ct);
    }

    private async Task SetEmailByDefaultAsync(bool email)
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.EmailCustomerOnStatusUpdateByDefault, email), Ct);
    }

    private async Task<int> StockOfAsync(int productId)
    {
        await using var db = api.CreateContext();
        return await db.Products.Where(p => p.Id == productId).Select(p => p.Stock).SingleAsync(Ct);
    }
}
