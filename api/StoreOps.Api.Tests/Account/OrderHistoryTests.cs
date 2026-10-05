using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using StoreOps.Api.Data;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Account;

// The demo store's customer has three orders: delivered, shipped and pending
public class OrderHistoryTests(ApiFixture api) : IClassFixture<ApiFixture>, IAsyncLifetime
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await api.SeedDemoStoreAsync();

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task Customers_see_their_orders_newest_first()
    {
        var customer = await api.SignInAsync("customer@example.test", DevSeeder.DemoPassword);

        var page = await customer.GetFromJsonAsync<JsonElement>("/api/account/orders", Ct);

        var orders = page.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(["SEED0003", "SEED0002", "SEED0001"], orders.Select(o => o.GetProperty("orderNumber").GetString()));
        Assert.Equal(["pending", "shipped", "delivered"], orders.Select(o => o.GetProperty("status").GetString()));
        // Oil Paint Set, then three Fine Brushes, plus $10 shipping
        Assert.Equal(4, orders[0].GetProperty("itemCount").GetInt32());
        Assert.Equal(3499 + 3 * 699 + 1000, orders[0].GetProperty("totalCents").GetInt32());
    }

    [Fact]
    public async Task An_order_shows_what_was_bought_where_it_went_and_how_to_track_it()
    {
        var customer = await api.SignInAsync("customer@example.test", DevSeeder.DemoPassword);

        var order = await customer.GetFromJsonAsync<JsonElement>("/api/account/orders/SEED0001", Ct);

        Assert.Equal("delivered", order.GetProperty("status").GetString());
        Assert.Equal(["Brush Set", "Rectangle Canvas"],
            order.GetProperty("lines").EnumerateArray().Select(l => l.GetProperty("name").GetString()).Order());
        Assert.Equal(["pending", "shipped", "delivered"],
            order.GetProperty("timeline").EnumerateArray().Select(s => s.GetProperty("status").GetString()));
        Assert.Equal("ups", order.GetProperty("carrier").GetString());
        Assert.Equal("https://www.ups.com/track?tracknum=1Z999AA10123456784", order.GetProperty("trackingUrl").GetString());
        Assert.False(string.IsNullOrEmpty(order.GetProperty("shipTo").GetProperty("recipientName").GetString()));
        Assert.Equal(
            order.GetProperty("subtotalCents").GetInt32() + order.GetProperty("shippingCents").GetInt32() + order.GetProperty("taxCents").GetInt32(),
            order.GetProperty("totalCents").GetInt32());
    }

    [Fact]
    public async Task Another_customers_order_does_not_exist_for_you()
    {
        var stranger = await api.CreateCustomerClientAsync();

        var list = await stranger.GetFromJsonAsync<JsonElement>("/api/account/orders", Ct);

        Assert.Equal(0, list.GetProperty("totalCount").GetInt32());
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync("/api/account/orders/SEED0001", Ct)).StatusCode);
    }
}
