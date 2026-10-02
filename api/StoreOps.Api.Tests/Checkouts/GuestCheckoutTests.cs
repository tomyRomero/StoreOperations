using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Checkouts;

// Checking out without an account, and getting back to the order afterwards
public class GuestCheckoutTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task A_guest_checks_out_the_cart_from_their_browser()
    {
        var guest = api.Factory.CreateClient();
        var productId = await api.AddProductAsync(priceCents: 1250, stock: 20);

        var quote = await QuoteOf(await guest.PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("a.guest@example.test", productId, 2), Ct));

        // The browser sends products and quantities; the prices come from the store
        Assert.Equal(2500, quote.GetProperty("subtotalCents").GetInt32());
        Assert.Equal("Guest shopper", quote.GetProperty("shipTo").GetProperty("recipientName").GetString());

        // A guest has no Stripe customer
        var paymentIntentId = PaymentIntentIdOf(quote);
        Assert.Null(api.Payments.CustomerOfIntent[paymentIntentId]);
        Assert.Equal(quote.GetProperty("totalCents").GetInt32(), api.Payments.IntentOf(paymentIntentId).AmountCents);

        await using var db = api.CreateContext();
        var checkout = await db.Checkouts.SingleAsync(c => c.StripePaymentIntentId == paymentIntentId, Ct);
        Assert.Null(checkout.UserId);
        Assert.Equal("a.guest@example.test", checkout.Email);
        Assert.Matches("^[0-9a-f]{48}$", checkout.GuestKey);
    }

    [Fact]
    public async Task Starting_again_in_the_same_browser_updates_the_same_quote_and_payment()
    {
        var guest = api.Factory.CreateClient();
        var productId = await api.AddProductAsync(priceCents: 1000, stock: 20);
        var first = await QuoteOf(await guest.PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("again@example.test", productId), Ct));
        var createdBefore = api.Payments.PaymentIntentsCreated;

        var second = await QuoteOf(await guest.PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("again@example.test", productId, 3), Ct));

        Assert.Equal(first.GetProperty("checkoutId").GetInt32(), second.GetProperty("checkoutId").GetInt32());
        Assert.Equal(PaymentIntentIdOf(first), PaymentIntentIdOf(second));
        Assert.Equal(createdBefore, api.Payments.PaymentIntentsCreated);
        Assert.Equal(3000, second.GetProperty("subtotalCents").GetInt32());

        // Another browser is another guest
        var other = await QuoteOf(await api.Factory.CreateClient().PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("again@example.test", productId), Ct));
        Assert.NotEqual(first.GetProperty("checkoutId").GetInt32(), other.GetProperty("checkoutId").GetInt32());
    }

    [Fact]
    public async Task A_paid_guest_checkout_becomes_an_order_with_a_private_link()
    {
        var sale = await api.PaidGuestCheckoutAsync(priceCents: 1500, quantity: 2);

        await api.WebhookArrivesAsync(sale);

        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        Assert.Null(order.UserId);
        Assert.Equal(sale.Email, order.Email);
        Assert.Matches("^[0-9a-f]{48}$", order.AccessToken);
        Assert.Equal(sale.Intent.AmountCents, order.TotalCents);

        // The confirmation links to the private page, not to an account
        var confirmation = await db.EmailOutbox.SingleAsync(m => m.ToAddress == sale.Email && m.Kind == EmailKind.OrderConfirmation, Ct);
        Assert.Contains($"/orders/{order.AccessToken}", confirmation.TextBody);
        Assert.DoesNotContain("/account/orders", confirmation.TextBody);

        // Back from Stripe, the guest's browser gets the link too
        var result = await sale.Customer.GetFromJsonAsync<JsonElement>($"/api/checkout/result?paymentIntentId={sale.Intent.Id}", Ct);
        Assert.Equal("paid", result.GetProperty("result").GetString());
        Assert.Equal(order.OrderNumber, result.GetProperty("orderNumber").GetString());
        Assert.Equal(order.AccessToken, result.GetProperty("orderToken").GetString());

        // The link opens the order for anyone holding it, with no account
        var page = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>($"/api/orders/{order.AccessToken}", Ct);
        Assert.Equal(sale.Email, page.GetProperty("email").GetString());
        Assert.False(page.GetProperty("inAccount").GetBoolean());
        Assert.Equal(order.OrderNumber, page.GetProperty("order").GetProperty("orderNumber").GetString());
        Assert.Equal(2, Assert.Single(page.GetProperty("order").GetProperty("lines").EnumerateArray()).GetProperty("quantity").GetInt32());
    }

    [Fact]
    public async Task Only_the_guests_own_browser_sees_the_checkout_result()
    {
        var sale = await api.PaidGuestCheckoutAsync();
        await api.WebhookArrivesAsync(sale);

        var stranger = await api.Factory.CreateClient().GetAsync($"/api/checkout/result?paymentIntentId={sale.Intent.Id}", Ct);
        var customer = await (await api.CreateCustomerClientAsync()).GetAsync($"/api/checkout/result?paymentIntentId={sale.Intent.Id}", Ct);

        Assert.Equal(HttpStatusCode.NotFound, stranger.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, customer.StatusCode);
    }

    [Fact]
    public async Task A_made_up_link_finds_no_order()
    {
        var response = await api.Factory.CreateClient().GetAsync($"/api/orders/{new string('a', 48)}", Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task A_guest_needs_an_email_an_address_and_something_to_buy()
    {
        var guest = api.Factory.CreateClient();
        var productId = await api.AddProductAsync();
        var archivedId = await api.AddProductAsync(archived: true);

        var badEmail = await guest.PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("not-an-email", productId), Ct);
        var noAddress = await guest.PostAsJsonAsync("/api/checkout/guest",
            new { email = "a@example.test", items = new[] { new { productId, quantity = 1 } } }, Ct);
        var nothing = await guest.PostAsJsonAsync("/api/checkout/guest",
            new { email = "a@example.test", address = new { recipientName = "A", line1 = "1 A St", city = "Austin", countryCode = "US" }, items = Array.Empty<object>() }, Ct);
        var archived = await guest.PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("a@example.test", archivedId), Ct);

        Assert.Equal(HttpStatusCode.BadRequest, badEmail.StatusCode);
        Assert.True((await BodyOf(badEmail)).GetProperty("errors").TryGetProperty("email", out _));
        Assert.Equal(HttpStatusCode.BadRequest, noAddress.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, nothing.StatusCode);
        Assert.True((await BodyOf(nothing)).GetProperty("errors").TryGetProperty("items", out _));
        Assert.Equal(HttpStatusCode.Conflict, archived.StatusCode);
        Assert.Equal("CART_NOT_READY", await CodeOf(archived));
    }

    [Fact]
    public async Task The_store_can_require_an_account_to_check_out()
    {
        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct);
        Assert.True(store.GetProperty("guestCheckout").GetBoolean());

        await SetGuestCheckoutAsync(false);
        try
        {
            var productId = await api.AddProductAsync();
            var response = await api.Factory.CreateClient().PostAsJsonAsync("/api/checkout/guest", Shopping.GuestCheckout("a@example.test", productId), Ct);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal("GUEST_CHECKOUT_OFF", await CodeOf(response));
            Assert.False((await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct)).GetProperty("guestCheckout").GetBoolean());
        }
        finally
        {
            await SetGuestCheckoutAsync(true);
        }
    }

    [Fact]
    public async Task Find_your_order_emails_the_link_to_the_address_the_order_was_placed_with()
    {
        var (sale, order) = await GuestOrderAsync();

        // Typed loosely: another letter case, a leading # and spaces
        var response = await api.Factory.CreateClient().PostAsJsonAsync("/api/orders/find",
            new { email = sale.Email.ToUpperInvariant(), orderNumber = $" #{order.OrderNumber.ToLowerInvariant()} " }, Ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var link = await OrderLinkEmailAsync(sale.Email);
        Assert.Contains($"/orders/{order.AccessToken}", link.TextBody);
    }

    [Fact]
    public async Task Find_your_order_says_the_same_whatever_was_typed_and_emails_no_one_else()
    {
        var (sale, order) = await GuestOrderAsync();

        var wrongEmail = await api.Factory.CreateClient().PostAsJsonAsync("/api/orders/find",
            new { email = "someone.else@example.test", orderNumber = order.OrderNumber }, Ct);
        var wrongNumber = await api.Factory.CreateClient().PostAsJsonAsync("/api/orders/find",
            new { email = sale.Email, orderNumber = "ZZZZZZZZ" }, Ct);

        Assert.Equal(HttpStatusCode.NoContent, wrongEmail.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, wrongNumber.StatusCode);
        await using var db = api.CreateContext();
        Assert.False(await db.EmailOutbox.AnyAsync(m => m.Kind == EmailKind.OrderLink && (m.ToAddress == sale.Email || m.ToAddress == "someone.else@example.test"), Ct));
    }

    [Fact]
    public async Task Find_your_order_sends_a_customer_to_their_account()
    {
        var sale = await api.PaidCheckoutAsync();
        await api.WebhookArrivesAsync(sale);
        await using var db = api.CreateContext();
        var number = await db.Orders.Where(o => o.StripePaymentIntentId == sale.Intent.Id).Select(o => o.OrderNumber).SingleAsync(Ct);

        await api.Factory.CreateClient().PostAsJsonAsync("/api/orders/find", new { email = sale.Email, orderNumber = number }, Ct);

        Assert.Contains($"/account/orders/{number}", (await OrderLinkEmailAsync(sale.Email)).TextBody);
    }

    [Fact]
    public async Task A_guest_can_save_the_order_to_an_account_with_the_same_email()
    {
        var (sale, order) = await GuestOrderAsync();
        var account = await RegisterAsync(sale.Email);

        var saved = await account.PostAsync($"/api/orders/{order.AccessToken}/save", null, Ct);

        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        Assert.Equal(order.OrderNumber, (await BodyOf(saved)).GetProperty("orderNumber").GetString());
        var inHistory = await account.GetAsync($"/api/account/orders/{order.OrderNumber}", Ct);
        Assert.Equal(HttpStatusCode.OK, inHistory.StatusCode);
        // The emailed link keeps working, and now says where the order lives
        var page = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>($"/api/orders/{order.AccessToken}", Ct);
        Assert.True(page.GetProperty("inAccount").GetBoolean());
        // Saving again changes nothing
        Assert.Equal(HttpStatusCode.OK, (await account.PostAsync($"/api/orders/{order.AccessToken}/save", null, Ct)).StatusCode);
    }

    [Fact]
    public async Task Only_an_account_with_the_orders_email_can_save_it()
    {
        var (_, order) = await GuestOrderAsync();
        var someoneElse = await api.CreateCustomerClientAsync();

        var refused = await someoneElse.PostAsync($"/api/orders/{order.AccessToken}/save", null, Ct);
        var signedOut = await api.Factory.CreateClient().PostAsync($"/api/orders/{order.AccessToken}/save", null, Ct);

        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        Assert.Equal("ORDER_EMAIL_MISMATCH", await CodeOf(refused));
        Assert.Equal(HttpStatusCode.Unauthorized, signedOut.StatusCode);
        await using var db = api.CreateContext();
        Assert.Null(await db.Orders.Where(o => o.Id == order.Id).Select(o => o.UserId).SingleAsync(Ct));
    }

    [Fact]
    public async Task Admins_see_a_guests_order_and_its_updates_reach_the_guest()
    {
        var (sale, order) = await GuestOrderAsync();
        var admin = await api.CreateAdminClientAsync();

        var list = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders?search={Uri.EscapeDataString(sale.Email)}", Ct);
        var row = Assert.Single(list.GetProperty("items").EnumerateArray());
        Assert.True(row.GetProperty("isGuest").GetBoolean());
        Assert.Equal("Guest shopper", row.GetProperty("customerName").GetString());
        Assert.Equal(sale.Email, row.GetProperty("customerEmail").GetString());

        var opened = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders/{order.OrderNumber}", Ct);
        Assert.Equal(JsonValueKind.Null, opened.GetProperty("customerId").ValueKind);

        var shipped = await admin.PutAsJsonAsync($"/api/admin/orders/{order.OrderNumber}", new
        {
            status = "shipped",
            carrier = "ups",
            trackingNumber = "1Z999AA10123456784",
            emailCustomer = true,
            confirmRefund = false,
            rowVersion = opened.GetProperty("rowVersion").GetString(),
        }, Ct);
        Assert.Equal(HttpStatusCode.OK, shipped.StatusCode);

        await using var db = api.CreateContext();
        var update = await db.EmailOutbox.SingleAsync(m => m.ToAddress == sale.Email && m.Kind == EmailKind.OrderStatusUpdate, Ct);
        Assert.Contains($"/orders/{order.AccessToken}", update.TextBody);
    }

    // A guest's paid order, placed by the webhook
    private async Task<(Sale Sale, Order Order)> GuestOrderAsync()
    {
        var sale = await api.PaidGuestCheckoutAsync();
        await api.WebhookArrivesAsync(sale);
        await using var db = api.CreateContext();
        return (sale, await db.Orders.AsNoTracking().SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct));
    }

    private async Task<HttpClient> RegisterAsync(string email)
    {
        var client = api.Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"u-{Guid.NewGuid():N}"[..20],
            email,
            password = ApiFixture.Password,
        }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return client;
    }

    private async Task<EmailOutboxMessage> OrderLinkEmailAsync(string address)
    {
        await using var db = api.CreateContext();
        return await db.EmailOutbox.SingleAsync(m => m.ToAddress == address && m.Kind == EmailKind.OrderLink, Ct);
    }

    private async Task SetGuestCheckoutAsync(bool on)
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.GuestCheckout, on), Ct);
    }

    private static async Task<JsonElement> QuoteOf(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await BodyOf(response);
    }

    // The client secret is "<PaymentIntent id>_secret_..."
    private static string PaymentIntentIdOf(JsonElement quote) =>
        quote.GetProperty("clientSecret").GetString()!.Split("_secret_")[0];

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);

    private static async Task<string?> CodeOf(HttpResponseMessage response) => (await BodyOf(response)).GetProperty("code").GetString();
}
