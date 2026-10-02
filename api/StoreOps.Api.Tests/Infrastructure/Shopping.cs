using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Tests.Infrastructure;

public sealed record Sale(HttpClient Customer, string Email, int ProductId, PaymentIntentState Intent);

// A customer going through the store: cart, address, checkout, payment
public static class Shopping
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // A new customer who checked out and paid for one product, before Stripe's webhook arrives
    public static async Task<Sale> PaidCheckoutAsync(
        this ApiFixture api, int priceCents = 1000, int quantity = 1, int stock = 10, string? productName = null)
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(priceCents: priceCents, stock: stock, name: productName);
        var added = await customer.PostAsJsonAsync("/api/cart/items", new { productId, quantity }, Ct);
        Assert.Equal(HttpStatusCode.OK, added.StatusCode);
        return await api.PayForCartAsync(customer, productId);
    }

    // The customer's cart, checked out to a new address and paid
    public static async Task<Sale> PayForCartAsync(this ApiFixture api, HttpClient customer, int productId)
    {
        var address = await customer.PostAsJsonAsync("/api/account/addresses", new
        {
            recipientName = "Test shopper",
            line1 = "1 Easel Way",
            city = "Portland",
            state = "OR",
            postalCode = "97201",
            countryCode = "US",
        }, Ct);
        var addressId = (await address.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("id").GetInt32();
        var checkout = await customer.PostAsJsonAsync("/api/checkout", new { addressId }, Ct);
        Assert.Equal(HttpStatusCode.OK, checkout.StatusCode);
        var clientSecret = (await checkout.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("clientSecret").GetString()!;
        var email = (await customer.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("email").GetString()!;

        return new Sale(customer, email, productId, api.Payments.Pay(clientSecret.Split("_secret_")[0]));
    }

    // Stripe's webhook for the payment arrives
    public static async Task WebhookArrivesAsync(this ApiFixture api, Sale sale)
    {
        var response = await StripeEvents.SendAsync(api.Factory.CreateClient(), StripeEvents.PaymentSucceeded(sale.Intent));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
