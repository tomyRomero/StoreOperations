using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Checkouts;

public class CheckoutTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Checkout_prices_the_cart_from_the_database_with_shipping_and_tax()
    {
        var (customer, _, addressId) = await ShopperWithCartAsync(priceCents: 1250, quantity: 2);

        var quote = await QuoteOf(await StartAsync(customer, addressId));

        Assert.Equal(2500, quote.GetProperty("subtotalCents").GetInt32());
        Assert.Equal(1000, quote.GetProperty("shippingCents").GetInt32());
        // D-26: shipping is taxed along with the products
        Assert.Equal(FakePayments.TaxOn(3500), quote.GetProperty("taxCents").GetInt32());
        Assert.Equal(3500 + FakePayments.TaxOn(3500), quote.GetProperty("totalCents").GetInt32());
        Assert.Equal("Test shopper", quote.GetProperty("shipTo").GetProperty("recipientName").GetString());

        var intent = api.Payments.IntentOf(PaymentIntentIdOf(quote));
        Assert.Equal(quote.GetProperty("totalCents").GetInt32(), intent.AmountCents);
        Assert.Equal(intent.ClientSecret, quote.GetProperty("clientSecret").GetString());
    }

    [Fact]
    public async Task Starting_again_after_a_change_updates_the_same_quote_and_payment()
    {
        var (customer, productId, addressId) = await ShopperWithCartAsync(priceCents: 1000, quantity: 1);
        var first = await QuoteOf(await StartAsync(customer, addressId));
        var createdBefore = api.Payments.PaymentIntentsCreated;

        await customer.PutAsJsonAsync($"/api/cart/items/{productId}", new { quantity = 3 }, Ct);
        var second = await QuoteOf(await StartAsync(customer, addressId));

        Assert.Equal(first.GetProperty("checkoutId").GetInt32(), second.GetProperty("checkoutId").GetInt32());
        Assert.Equal(PaymentIntentIdOf(first), PaymentIntentIdOf(second));
        Assert.Equal(createdBefore, api.Payments.PaymentIntentsCreated);
        Assert.Equal(3000, second.GetProperty("subtotalCents").GetInt32());
        Assert.Equal(second.GetProperty("totalCents").GetInt32(), api.Payments.IntentOf(PaymentIntentIdOf(second)).AmountCents);
    }

    [Fact]
    public async Task Shipping_is_free_above_the_stores_threshold()
    {
        await using (var db = api.CreateContext())
            await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.FreeShippingThresholdCents, 5000), Ct);
        try
        {
            var (customer, _, addressId) = await ShopperWithCartAsync(priceCents: 5000, quantity: 1);

            var quote = await QuoteOf(await StartAsync(customer, addressId));

            Assert.Equal(0, quote.GetProperty("shippingCents").GetInt32());
        }
        finally
        {
            await using var db = api.CreateContext();
            await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.FreeShippingThresholdCents, (int?)null), Ct);
        }
    }

    [Fact]
    public async Task The_stripe_customer_is_created_at_the_first_checkout_and_reused()
    {
        var (customer, _, addressId) = await ShopperWithCartAsync();
        var userId = (await customer.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("id").GetInt32();

        await StartAsync(customer, addressId);
        await StartAsync(customer, addressId);

        Assert.Single(api.Payments.CustomersCreated, id => id == $"cus_test_{userId}");
        await using var db = api.CreateContext();
        Assert.Equal($"cus_test_{userId}", await db.Users.Where(u => u.Id == userId).Select(u => u.StripeCustomerId).SingleAsync(Ct));
    }

    [Fact]
    public async Task Checkout_needs_a_cart_that_can_be_bought()
    {
        var empty = await api.CreateCustomerClientAsync();
        var emptyAddress = await AddAddressAsync(empty);
        var (soldOut, productId, soldOutAddress) = await ShopperWithCartAsync();
        await using (var db = api.CreateContext())
            await db.Products.Where(p => p.Id == productId).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, 0), Ct);

        var emptyCart = await StartAsync(empty, emptyAddress);
        var notReady = await StartAsync(soldOut, soldOutAddress);

        Assert.Equal("CART_EMPTY", await CodeOf(emptyCart));
        Assert.Equal("CART_NOT_READY", await CodeOf(notReady));
    }

    [Fact]
    public async Task Checkout_only_ships_to_one_of_your_own_addresses()
    {
        var (customer, _, _) = await ShopperWithCartAsync();
        var stranger = await api.CreateCustomerClientAsync();
        var strangersAddress = await AddAddressAsync(stranger);

        var response = await StartAsync(customer, strangersAddress);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("addressId", out _));
    }

    [Fact]
    public async Task Once_paid_the_quote_is_final()
    {
        var (customer, _, addressId) = await ShopperWithCartAsync();
        var quote = await QuoteOf(await StartAsync(customer, addressId));
        api.Payments.Pay(PaymentIntentIdOf(quote));

        var again = await StartAsync(customer, addressId);

        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("PAYMENT_IN_PROGRESS", await CodeOf(again));
    }

    [Fact]
    public async Task Checkout_is_closed_until_stripe_is_set_up()
    {
        await using var withoutStripe = api.Factory.WithWebHostBuilder(builder => builder.UseSetting("Stripe:SecretKey", ""));
        var customer = withoutStripe.CreateClient();
        await customer.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"u-{Guid.NewGuid():N}"[..20], email = $"{Guid.NewGuid():N}@example.test", password = ApiFixture.Password,
        }, Ct);

        var response = await StartAsync(customer, 1);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("PAYMENTS_NOT_CONFIGURED", await CodeOf(response));
    }

    [Fact]
    public async Task A_live_stripe_key_stops_the_api_from_starting()
    {
        await using var withLiveKey = api.Factory.WithWebHostBuilder(builder => builder.UseSetting("Stripe:SecretKey", "sk_live_not_allowed"));

        var error = Assert.ThrowsAny<Exception>(() => withLiveKey.CreateClient());

        Assert.Contains("test-mode key", error.ToString());
    }

    private async Task<(HttpClient Customer, int ProductId, int AddressId)> ShopperWithCartAsync(int priceCents = 1000, int quantity = 1)
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(priceCents: priceCents, stock: 20);
        var added = await customer.PostAsJsonAsync("/api/cart/items", new { productId, quantity }, Ct);
        Assert.Equal(HttpStatusCode.OK, added.StatusCode);
        return (customer, productId, await AddAddressAsync(customer));
    }

    private static async Task<int> AddAddressAsync(HttpClient customer)
    {
        var response = await customer.PostAsJsonAsync("/api/account/addresses", new
        {
            recipientName = "Test shopper", line1 = "1 Easel Way", city = "Portland", state = "OR", postalCode = "97201", countryCode = "US",
        }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await BodyOf(response)).GetProperty("id").GetInt32();
    }

    private static Task<HttpResponseMessage> StartAsync(HttpClient customer, int addressId) =>
        customer.PostAsJsonAsync("/api/checkout", new { addressId }, Ct);

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
