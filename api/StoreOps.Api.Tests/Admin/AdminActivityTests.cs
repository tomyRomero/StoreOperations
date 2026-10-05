using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminActivityTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task An_accounts_history_is_newest_first_and_names_who_did_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminName = (await admin.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("username").GetString();
        var me = await (await api.CreateCustomerClientAsync()).GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);
        var id = me.GetProperty("id").GetInt32();
        await admin.PostAsync($"/api/admin/customers/{id}/disable", null, Ct);

        var feed = await FeedAsync(admin, $"entityType=user&entityId={id}");

        Assert.Equal(2, feed.GetProperty("totalCount").GetInt32());
        var (disabled, registered) = (feed.GetProperty("items")[0], feed.GetProperty("items")[1]);
        Assert.Equal("customer_disabled", disabled.GetProperty("action").GetString());
        Assert.Equal(adminName, disabled.GetProperty("actor").GetString());
        Assert.Equal("user_registered", registered.GetProperty("action").GetString());
        // The customer signed up themselves, so no admin is named
        Assert.Equal(JsonValueKind.Null, registered.GetProperty("actor").ValueKind);
        Assert.Equal(me.GetProperty("username").GetString(), registered.GetProperty("details").GetProperty("username").GetString());
    }

    [Fact]
    public async Task An_orders_history_shows_its_statuses_by_name()
    {
        var admin = await api.CreateAdminClientAsync();
        var sale = await api.PaidCheckoutAsync();
        await api.WebhookArrivesAsync(sale);
        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.StripePaymentIntentId == sale.Intent.Id, Ct);
        var opened = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders/{order.OrderNumber}", Ct);
        await admin.PutAsJsonAsync($"/api/admin/orders/{order.OrderNumber}",
            new { status = "shipped", rowVersion = opened.GetProperty("rowVersion").GetString() }, Ct);

        var feed = await FeedAsync(admin, $"entityType=order&entityId={order.Id}");

        var shipped = feed.GetProperty("items")[0];
        Assert.Equal("order_status_changed", shipped.GetProperty("action").GetString());
        Assert.Equal(order.OrderNumber, shipped.GetProperty("details").GetProperty("orderNumber").GetString());
        Assert.Equal("pending", shipped.GetProperty("details").GetProperty("from").GetString());
        Assert.Equal("shipped", shipped.GetProperty("details").GetProperty("to").GetString());
        Assert.Equal("order_created", feed.GetProperty("items")[1].GetProperty("action").GetString());
    }

    [Fact]
    public async Task The_feed_is_paged()
    {
        var admin = await api.CreateAdminClientAsync();
        await api.CreateCustomerClientAsync();

        var firstPage = await FeedAsync(admin, "pageSize=1");
        var secondPage = await FeedAsync(admin, "pageSize=1&page=2");

        Assert.Single(firstPage.GetProperty("items").EnumerateArray());
        Assert.True(firstPage.GetProperty("totalCount").GetInt32() >= 2);
        Assert.NotEqual(
            firstPage.GetProperty("items")[0].GetProperty("id").GetInt32(),
            secondPage.GetProperty("items")[0].GetProperty("id").GetInt32());
    }

    private static Task<JsonElement> FeedAsync(HttpClient admin, string query) =>
        admin.GetFromJsonAsync<JsonElement>($"/api/admin/activity?{query}", Ct);
}
