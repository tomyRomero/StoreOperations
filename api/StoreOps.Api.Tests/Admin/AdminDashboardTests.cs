using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

// Each test compares the dashboard before and after its own orders, so other tests' orders don't matter
public class AdminDashboardTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Revenue_is_the_item_subtotal_of_orders_that_went_ahead()
    {
        var admin = await api.CreateAdminClientAsync();
        var before = await DashboardAsync(admin);
        await PlacedOrderAsync(priceCents: 1500, quantity: 2);
        var cancelled = await PlacedOrderAsync(priceCents: 1000);
        await ChangeStatusAsync(admin, cancelled, "cancelled");

        var after = await DashboardAsync(admin);

        Assert.Equal(Kpi(before, "revenueCents") + 3000, Kpi(after, "revenueCents"));
        Assert.Equal(Kpi(before, "orders") + 1, Kpi(after, "orders"));
        Assert.Equal(
            (int)Math.Round((double)Kpi(after, "revenueCents") / Kpi(after, "orders")),
            Kpi(after, "averageOrderCents"));
        // Today's point on the revenue chart, and one more cancelled order by status
        Assert.Equal(Today(before).GetProperty("revenueCents").GetInt32() + 3000, Today(after).GetProperty("revenueCents").GetInt32());
        Assert.Equal(StatusCount(before, "cancelled") + 1, StatusCount(after, "cancelled"));
    }

    [Fact]
    public async Task Older_orders_count_towards_the_previous_period()
    {
        var admin = await api.CreateAdminClientAsync();
        var before = await DashboardAsync(admin, days: 7);
        var number = await PlacedOrderAsync(priceCents: 2500);
        await using (var db = api.CreateContext())
        {
            var tenDaysAgo = DateTime.UtcNow.AddDays(-10);
            await db.Orders.Where(o => o.OrderNumber == number).ExecuteUpdateAsync(s => s.SetProperty(o => o.PlacedAtUtc, tenDaysAgo), Ct);
        }

        var after = await DashboardAsync(admin, days: 7);

        Assert.Equal(Kpi(before, "revenueCents"), Kpi(after, "revenueCents"));
        Assert.Equal(Previous(before, "revenueCents") + 2500, Previous(after, "revenueCents"));
        var days = after.GetProperty("revenueByDay").EnumerateArray().Select(d => DateOnly.Parse(d.GetProperty("date").GetString()!, CultureInfo.InvariantCulture)).ToList();
        Assert.Equal(7, days.Count);
        Assert.Equal(DateOnly.Parse(after.GetProperty("first").GetString()!, CultureInfo.InvariantCulture), days[0]);
        Assert.Equal(DateOnly.Parse(after.GetProperty("last").GetString()!, CultureInfo.InvariantCulture), days[^1]);
    }

    [Fact]
    public async Task Orders_to_ship_are_the_pending_ones()
    {
        var admin = await api.CreateAdminClientAsync();
        var before = await DashboardAsync(admin);
        var number = await PlacedOrderAsync();
        var waiting = await DashboardAsync(admin);

        await ChangeStatusAsync(admin, number, "shipped");

        Assert.Equal(Kpi(before, "toShip") + 1, Kpi(waiting, "toShip"));
        Assert.Equal(Kpi(before, "toShip"), Kpi(await DashboardAsync(admin), "toShip"));
    }

    [Fact]
    public async Task Low_stock_lists_products_on_sale_at_or_under_the_threshold()
    {
        var admin = await api.CreateAdminClientAsync();
        var before = await DashboardAsync(admin);
        var low = await api.AddProductAsync(stock: 2);
        var archived = await api.AddProductAsync(stock: 1, archived: true);
        await api.AddProductAsync(stock: 50);

        var after = await DashboardAsync(admin);

        Assert.Equal(Kpi(before, "lowStock") + 1, Kpi(after, "lowStock"));
        var listed = after.GetProperty("lowStockProducts").EnumerateArray().ToList();
        Assert.Contains(listed, p => p.GetProperty("productId").GetInt32() == low && p.GetProperty("stock").GetInt32() == 2);
        Assert.DoesNotContain(listed, p => p.GetProperty("productId").GetInt32() == archived);
    }

    [Fact]
    public async Task The_best_seller_by_quantity_comes_first()
    {
        var admin = await api.CreateAdminClientAsync();
        var sale = await api.PaidCheckoutAsync(priceCents: 800, quantity: 7, stock: 20);
        await api.WebhookArrivesAsync(sale);

        var top = (await DashboardAsync(admin)).GetProperty("topProducts")[0];

        Assert.Equal(sale.ProductId, top.GetProperty("productId").GetInt32());
        Assert.Equal(7, top.GetProperty("quantity").GetInt32());
        Assert.Equal(5600, top.GetProperty("revenueCents").GetInt32());
    }

    [Fact]
    public async Task New_customers_leave_out_admins()
    {
        var admin = await api.CreateAdminClientAsync();
        var before = await DashboardAsync(admin);

        await api.CreateCustomerClientAsync();
        await api.CreateAdminClientAsync();

        Assert.Equal(Kpi(before, "newCustomers") + 1, Kpi(await DashboardAsync(admin), "newCustomers"));
    }

    [Fact]
    public async Task Days_are_the_stores_days()
    {
        var admin = await api.CreateAdminClientAsync();
        await SetTimeZoneAsync("Pacific/Kiritimati");
        try
        {
            var dashboard = await DashboardAsync(admin);

            // UTC+14: usually already tomorrow in UTC terms
            var storeToday = DateOnly.FromDateTime(
                TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Pacific/Kiritimati")));
            Assert.Equal("Pacific/Kiritimati", dashboard.GetProperty("timeZoneId").GetString());
            Assert.Equal(storeToday, DateOnly.Parse(dashboard.GetProperty("last").GetString()!, CultureInfo.InvariantCulture));
        }
        finally
        {
            await SetTimeZoneAsync("America/New_York");
        }
    }

    [Fact]
    public async Task The_period_is_between_one_day_and_a_year()
    {
        var admin = await api.CreateAdminClientAsync();

        Assert.Equal(HttpStatusCode.BadRequest, (await admin.GetAsync("/api/admin/dashboard?days=0", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.GetAsync("/api/admin/dashboard?days=366", Ct)).StatusCode);
    }

    private static Task<JsonElement> DashboardAsync(HttpClient admin, int days = 30) =>
        admin.GetFromJsonAsync<JsonElement>($"/api/admin/dashboard?days={days}", Ct);

    private static int Kpi(JsonElement dashboard, string name)
    {
        var kpi = dashboard.GetProperty("kpis").GetProperty(name);
        return kpi.ValueKind == JsonValueKind.Number ? kpi.GetInt32() : kpi.GetProperty("value").GetInt32();
    }

    private static int Previous(JsonElement dashboard, string name) =>
        dashboard.GetProperty("kpis").GetProperty(name).GetProperty("previous").GetInt32();

    private static JsonElement Today(JsonElement dashboard) => dashboard.GetProperty("revenueByDay").EnumerateArray().Last();

    private static int StatusCount(JsonElement dashboard, string status) =>
        dashboard.GetProperty("ordersByStatus").EnumerateArray()
            .Where(s => s.GetProperty("status").GetString() == status)
            .Select(s => s.GetProperty("count").GetInt32())
            .SingleOrDefault();

    // A customer's paid order, placed by Stripe's webhook
    private async Task<string> PlacedOrderAsync(int priceCents = 1000, int quantity = 1)
    {
        var sale = await api.PaidCheckoutAsync(priceCents: priceCents, quantity: quantity);
        await api.WebhookArrivesAsync(sale);
        await using var db = api.CreateContext();
        return await db.Orders.Where(o => o.StripePaymentIntentId == sale.Intent.Id).Select(o => o.OrderNumber).SingleAsync(Ct);
    }

    private static async Task ChangeStatusAsync(HttpClient admin, string number, string status)
    {
        var opened = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders/{number}", Ct);
        var response = await admin.PutAsJsonAsync($"/api/admin/orders/{number}",
            new { status, confirmRefund = true, rowVersion = opened.GetProperty("rowVersion").GetString() }, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task SetTimeZoneAsync(string timeZoneId)
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.TimeZoneId, timeZoneId), Ct);
    }
}
