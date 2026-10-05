using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Cart;

public class CartTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task A_product_goes_into_the_cart_at_todays_price()
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(priceCents: 1250, stock: 10);

        var cart = await CartOf(await AddAsync(customer, productId, 2));

        var line = Assert.Single(cart.GetProperty("lines").EnumerateArray());
        Assert.Equal(productId, line.GetProperty("productId").GetInt32());
        Assert.Equal(2, line.GetProperty("quantity").GetInt32());
        Assert.Equal(2500, line.GetProperty("lineTotalCents").GetInt32());
        Assert.Equal(JsonValueKind.Null, line.GetProperty("issue").ValueKind);
        Assert.Equal(2, cart.GetProperty("itemCount").GetInt32());
        Assert.Equal(2500, cart.GetProperty("subtotalCents").GetInt32());
        Assert.True(cart.GetProperty("canCheckout").GetBoolean());
    }

    [Fact]
    public async Task Adding_again_adds_to_the_quantity_and_setting_it_replaces_it()
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(stock: 10);

        await AddAsync(customer, productId, 1);
        var added = await CartOf(await AddAsync(customer, productId, 2));
        var set = await CartOf(await customer.PutAsJsonAsync($"/api/cart/items/{productId}", new { quantity = 7 }, Ct));
        var removed = await CartOf(await customer.DeleteAsync($"/api/cart/items/{productId}", Ct));

        Assert.Equal(3, QuantityOf(added, productId));
        Assert.Equal(7, QuantityOf(set, productId));
        Assert.Empty(removed.GetProperty("lines").EnumerateArray());
        Assert.False(removed.GetProperty("canCheckout").GetBoolean());
    }

    [Fact]
    public async Task More_than_is_in_stock_cannot_be_added()
    {
        var customer = await api.CreateCustomerClientAsync();
        var fewLeft = await api.AddProductAsync(stock: 3);
        var soldOut = await api.AddProductAsync(stock: 0);

        var tooMany = await AddAsync(customer, fewLeft, 4);
        var none = await AddAsync(customer, soldOut, 1);
        var allOfThem = await AddAsync(customer, fewLeft, 3);

        Assert.Equal(HttpStatusCode.Conflict, tooMany.StatusCode);
        var problem = await BodyOf(tooMany);
        Assert.Equal("NOT_ENOUGH_STOCK", problem.GetProperty("code").GetString());
        Assert.Equal("Only 3 left in stock.", problem.GetProperty("detail").GetString());
        Assert.Equal("This product is out of stock.", (await BodyOf(none)).GetProperty("detail").GetString());
        Assert.Equal(HttpStatusCode.OK, allOfThem.StatusCode);
    }

    [Fact]
    public async Task Products_the_store_no_longer_sells_cannot_be_added()
    {
        var customer = await api.CreateCustomerClientAsync();
        var archived = await api.AddProductAsync(archived: true);

        Assert.Equal(HttpStatusCode.NotFound, (await AddAsync(customer, archived, 1)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await AddAsync(customer, 999999, 1)).StatusCode);
    }

    [Fact]
    public async Task At_most_99_of_one_product_fit_in_the_cart()
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(stock: 500);
        await AddAsync(customer, productId, 99);

        var hundredth = await AddAsync(customer, productId, 1);
        var setTooHigh = await customer.PutAsJsonAsync($"/api/cart/items/{productId}", new { quantity = 100 }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, hundredth.StatusCode);
        Assert.True((await BodyOf(hundredth)).GetProperty("errors").TryGetProperty("quantity", out _));
        Assert.Equal(HttpStatusCode.BadRequest, setTooHigh.StatusCode);
    }

    [Fact]
    public async Task The_cart_flags_lines_that_can_no_longer_be_bought()
    {
        var customer = await api.CreateCustomerClientAsync();
        var runningLow = await api.AddProductAsync(priceCents: 500, stock: 5);
        var retired = await api.AddProductAsync(priceCents: 700, stock: 5);
        var soldOut = await api.AddProductAsync(priceCents: 900, stock: 5);
        await AddAsync(customer, runningLow, 2);
        await AddAsync(customer, retired, 1);
        await AddAsync(customer, soldOut, 1);

        // Meanwhile: other orders take stock, and an admin archives a product
        await using (var db = api.CreateContext())
        {
            await db.Products.Where(p => p.Id == runningLow).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, 1), Ct);
            await db.Products.Where(p => p.Id == retired).ExecuteUpdateAsync(s => s.SetProperty(p => p.ArchivedAtUtc, DateTime.UtcNow), Ct);
            await db.Products.Where(p => p.Id == soldOut).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, 0), Ct);
        }

        var cart = await customer.GetFromJsonAsync<JsonElement>("/api/cart", Ct);

        Assert.Equal("not_enough_stock", IssueOf(cart, runningLow));
        Assert.Equal("unavailable", IssueOf(cart, retired));
        Assert.Equal("out_of_stock", IssueOf(cart, soldOut));
        Assert.False(cart.GetProperty("canCheckout").GetBoolean());
        // The archived product no longer counts towards the subtotal
        Assert.Equal(2 * 500 + 900, cart.GetProperty("subtotalCents").GetInt32());
    }

    [Fact]
    public async Task A_guest_cart_joins_the_saved_one_after_sign_in()
    {
        var customer = await api.CreateCustomerClientAsync();
        var inBoth = await api.AddProductAsync(stock: 10);
        var guestOnly = await api.AddProductAsync(stock: 2);
        var retired = await api.AddProductAsync(archived: true);
        await AddAsync(customer, inBoth, 4);

        var cart = await CartOf(await customer.PostAsJsonAsync("/api/cart/merge", new
        {
            items = new[]
            {
                new { productId = inBoth, quantity = 1 },
                new { productId = guestOnly, quantity = 5 },
                new { productId = retired, quantity = 1 },
                new { productId = 999999, quantity = 1 },
            },
        }, Ct));

        // The larger quantity wins, limited to what's in stock; products no longer sold are skipped
        Assert.Equal(4, QuantityOf(cart, inBoth));
        Assert.Equal(2, QuantityOf(cart, guestOnly));
        Assert.Equal(2, cart.GetProperty("lines").GetArrayLength());
    }

    [Fact]
    public async Task Guests_can_price_the_cart_in_their_browser_without_signing_in()
    {
        var guest = api.Factory.CreateClient();
        var productId = await api.AddProductAsync(priceCents: 1500, stock: 1);

        var preview = await CartOf(await guest.PostAsJsonAsync("/api/cart/preview",
            new { items = new[] { new { productId, quantity = 2 } } }, Ct));

        Assert.Equal(3000, preview.GetProperty("subtotalCents").GetInt32());
        Assert.Equal("not_enough_stock", IssueOf(preview, productId));
        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.GetAsync("/api/cart", Ct)).StatusCode);
    }

    [Fact]
    public async Task Each_customer_sees_only_their_own_cart()
    {
        var first = await api.CreateCustomerClientAsync();
        var second = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync();
        await AddAsync(first, productId, 1);

        var secondCart = await second.GetFromJsonAsync<JsonElement>("/api/cart", Ct);

        Assert.Empty(secondCart.GetProperty("lines").EnumerateArray());
    }

    // Admin accounts run the store; they test checkout as a guest
    [Fact]
    public async Task Admin_accounts_cannot_shop()
    {
        var admin = await api.CreateAdminClientAsync();
        var productId = await api.AddProductAsync();

        var add = await AddAsync(admin, productId, 1);
        var cart = await admin.GetAsync("/api/cart", Ct);
        var checkout = await admin.PostAsJsonAsync("/api/checkout", new { addressId = 1 }, Ct);

        Assert.Equal(HttpStatusCode.Forbidden, add.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, cart.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, checkout.StatusCode);
        await using var db = api.CreateContext();
        Assert.False(await db.CartItems.AnyAsync(i => i.ProductId == productId, Ct));
    }

    private static Task<HttpResponseMessage> AddAsync(HttpClient client, int productId, int quantity) =>
        client.PostAsJsonAsync("/api/cart/items", new { productId, quantity }, Ct);

    private static async Task<JsonElement> CartOf(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await BodyOf(response);
    }

    private static JsonElement LineOf(JsonElement cart, int productId) =>
        cart.GetProperty("lines").EnumerateArray().Single(l => l.GetProperty("productId").GetInt32() == productId);

    private static int QuantityOf(JsonElement cart, int productId) => LineOf(cart, productId).GetProperty("quantity").GetInt32();

    private static string? IssueOf(JsonElement cart, int productId) => LineOf(cart, productId).GetProperty("issue").GetString();

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
