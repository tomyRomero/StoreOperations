using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Payments;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Checkouts;

// The Stripe webhook turning a paid checkout into an order
public class OrderPlacementTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task A_paid_checkout_becomes_an_order()
    {
        var sale = await api.PaidCheckoutAsync(priceCents: 1500, quantity: 2, stock: 5);

        var response = await StripeEvents.SendAsync(api.Factory.CreateClient(), StripeEvents.PaymentSucceeded(sale.Intent));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await using var db = api.CreateContext();
        var order = await db.Orders.Include(o => o.Lines).Include(o => o.StatusHistory)
            .SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        Assert.Matches("^[2-9A-HJ-NP-Z]{8}$", order.OrderNumber);
        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal(sale.Intent.AmountCents, order.TotalCents);
        Assert.Equal(3000, order.SubtotalCents);
        var line = Assert.Single(order.Lines);
        Assert.Equal((sale.ProductId, 2, 1500, 3000), (line.ProductId, line.Quantity, line.UnitPriceCents, line.LineTotalCents));
        Assert.Null(Assert.Single(order.StatusHistory).ChangedByUserId);
        Assert.Equal($"taxtxn_test_{order.OrderNumber}", order.StripeTaxTransactionId);

        Assert.Equal(3, await StockOfAsync(sale.ProductId));
        Assert.False(await db.CartItems.AnyAsync(i => i.ProductId == sale.ProductId, Ct));
        Assert.Equal(CheckoutStatus.Completed, await db.Checkouts.Where(c => c.StripePaymentIntentId == sale.Intent.Id).Select(c => c.Status).SingleAsync(Ct));
        Assert.True(await db.ActivityLog.AnyAsync(e => e.Action == ActivityAction.OrderCreated && e.EntityId == order.Id, Ct));

        var result = await ResultAsync(sale);
        Assert.Equal("paid", result.GetProperty("result").GetString());
        Assert.Equal(order.OrderNumber, result.GetProperty("orderNumber").GetString());
    }

    [Fact]
    public async Task A_webhook_delivered_again_or_twice_at_once_creates_exactly_one_order()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 1, stock: 5);
        var payload = StripeEvents.PaymentSucceeded(sale.Intent);

        var responses = await Task.WhenAll(
            StripeEvents.SendAsync(api.Factory.CreateClient(), payload),
            StripeEvents.SendAsync(api.Factory.CreateClient(), payload));
        var later = await StripeEvents.SendAsync(api.Factory.CreateClient(), payload);

        Assert.All(responses.Append(later), r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
        await using var db = api.CreateContext();
        Assert.Equal(1, await db.Orders.CountAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct));
        Assert.Equal(4, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task If_the_last_item_sold_meanwhile_the_payment_is_refunded()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 2, stock: 5);
        // Someone else bought most of it between this customer's checkout and payment
        await SetStockAsync(sale.ProductId, 1);

        await StripeEvents.SendAsync(api.Factory.CreateClient(), StripeEvents.PaymentSucceeded(sale.Intent));

        await using var db = api.CreateContext();
        var order = await db.Orders.Include(o => o.StatusHistory).SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        Assert.Equal(OrderStatus.Refunded, order.Status);
        Assert.Contains("sold out", order.StatusHistory.Single(s => s.Status == OrderStatus.Refunded).Note);
        Assert.Contains(sale.Intent.Id, api.Payments.Refunds);
        Assert.Equal(1, await StockOfAsync(sale.ProductId));
        // The cart stays, so the customer can try again, and no tax is recorded for money given back
        Assert.True(await db.CartItems.AnyAsync(i => i.ProductId == sale.ProductId, Ct));
        Assert.DoesNotContain(order.OrderNumber, api.Payments.TaxRecordedForOrders);
        Assert.Equal("refunded", (await ResultAsync(sale)).GetProperty("result").GetString());
    }

    [Fact]
    public async Task When_one_line_sold_out_the_stock_taken_for_the_others_is_put_back()
    {
        var customer = await api.CreateCustomerClientAsync();
        var plenty = await api.AddProductAsync(stock: 10);
        var scarce = await api.AddProductAsync(stock: 1);
        await customer.PostAsJsonAsync("/api/cart/items", new { productId = plenty, quantity = 3 }, Ct);
        await customer.PostAsJsonAsync("/api/cart/items", new { productId = scarce, quantity = 1 }, Ct);
        var sale = await api.PayForCartAsync(customer, plenty);
        await SetStockAsync(scarce, 0);

        await StripeEvents.SendAsync(api.Factory.CreateClient(), StripeEvents.PaymentSucceeded(sale.Intent));

        Assert.Equal(10, await StockOfAsync(plenty));
        Assert.Equal(0, await StockOfAsync(scarce));
    }

    [Fact]
    public async Task A_payment_that_does_not_match_its_quote_is_refunded()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 1, stock: 5);

        await StripeEvents.SendAsync(api.Factory.CreateClient(),
            StripeEvents.PaymentSucceeded(sale.Intent, amountReceivedCents: sale.Intent.AmountCents - 100));

        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        Assert.Equal(OrderStatus.Refunded, order.Status);
        Assert.Contains(sale.Intent.Id, api.Payments.Refunds);
        Assert.Equal(5, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task If_recording_tax_fails_stripes_retry_finishes_the_job()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 1, stock: 5);
        var payload = StripeEvents.PaymentSucceeded(sale.Intent);
        api.Payments.FailNextTaxRecording();

        var failed = await StripeEvents.SendAsync(api.Factory.CreateClient(), payload);
        var retried = await StripeEvents.SendAsync(api.Factory.CreateClient(), payload);

        Assert.Equal(HttpStatusCode.InternalServerError, failed.StatusCode);
        Assert.Equal(HttpStatusCode.OK, retried.StatusCode);
        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        Assert.Equal($"taxtxn_test_{order.OrderNumber}", order.StripeTaxTransactionId);
        Assert.Equal(4, await StockOfAsync(sale.ProductId));
    }

    [Fact]
    public async Task Events_without_stripes_signature_are_refused()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 1, stock: 5);

        var forged = await StripeEvents.SendAsync(api.Factory.CreateClient(), StripeEvents.PaymentSucceeded(sale.Intent), secret: "whsec_guessed");

        Assert.Equal(HttpStatusCode.BadRequest, forged.StatusCode);
        await using var db = api.CreateContext();
        Assert.False(await db.Orders.AnyAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct));
    }

    [Fact]
    public async Task Other_events_and_other_payments_are_acknowledged_and_ignored()
    {
        var client = api.Factory.CreateClient();
        var stranger = new PaymentIntentState("pi_from_another_app", "secret", PaymentIntentState.Succeeded, 500, 500);

        var otherEvent = await StripeEvents.SendAsync(client, StripeEvents.Other("customer.created"));
        var otherPayment = await StripeEvents.SendAsync(client, StripeEvents.PaymentSucceeded(stranger));

        Assert.Equal(HttpStatusCode.OK, otherEvent.StatusCode);
        Assert.Equal(HttpStatusCode.OK, otherPayment.StatusCode);
    }

    [Fact]
    public async Task Until_the_webhook_arrives_the_confirmation_page_waits()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 1, stock: 5);

        Assert.Equal("processing", (await ResultAsync(sale)).GetProperty("result").GetString());
    }

    private static async Task<JsonElement> ResultAsync(Sale sale) =>
        await sale.Customer.GetFromJsonAsync<JsonElement>($"/api/checkout/result?paymentIntentId={sale.Intent.Id}", Ct);

    private async Task<int> StockOfAsync(int productId)
    {
        await using var db = api.CreateContext();
        return await db.Products.Where(p => p.Id == productId).Select(p => p.Stock).SingleAsync(Ct);
    }

    private async Task SetStockAsync(int productId, int stock)
    {
        await using var db = api.CreateContext();
        await db.Products.Where(p => p.Id == productId).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, stock), Ct);
    }
}
