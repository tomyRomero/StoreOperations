using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminSettingsTests(ApiFixture api) : IClassFixture<ApiFixture>, IAsyncLifetime
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // Every test starts from the store's defaults: $10 flat shipping, no free shipping, no returns
    public async ValueTask InitializeAsync()
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s
            .SetProperty(x => x.StoreName, "Palettehub")
            .SetProperty(x => x.SupportEmail, (string?)null)
            .SetProperty(x => x.ShippingFlatRateCents, 1000)
            .SetProperty(x => x.FreeShippingThresholdCents, (int?)null)
            .SetProperty(x => x.ReturnPolicy, ReturnPolicy.NoReturns)
            .SetProperty(x => x.ReturnWindowDays, (short?)null)
            .SetProperty(x => x.ReturnPolicyNote, (string?)null)
            .SetProperty(x => x.LowStockThreshold, 5)
            .SetProperty(x => x.EmailCustomerOnStatusUpdateByDefault, false)
            .SetProperty(x => x.TimeZoneId, "America/New_York"), Ct);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task The_storefront_reads_what_customers_see_without_signing_in()
    {
        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct);

        Assert.Equal("Palettehub", store.GetProperty("storeName").GetString());
        Assert.Equal(1000, store.GetProperty("shippingFlatRateCents").GetInt32());
        Assert.Equal("no_returns", store.GetProperty("returnPolicy").GetString());
        Assert.Equal(5, store.GetProperty("lowStockThreshold").GetInt32());
        Assert.Equal("America/New_York", store.GetProperty("timeZoneId").GetString());
        // Nothing internal
        Assert.False(store.TryGetProperty("emailCustomerOnStatusUpdateByDefault", out _));
        Assert.False(store.TryGetProperty("rowVersion", out _));
    }

    [Fact]
    public async Task Saved_settings_reach_the_storefront_and_checkout_and_are_logged()
    {
        var admin = await api.CreateAdminClientAsync();
        var opened = await GetAsync(admin);

        var response = await SaveAsync(admin, opened, s =>
        {
            s["shippingFlatRateCents"] = 800;
            s["freeShippingThresholdCents"] = 5000;
            s["returnPolicy"] = "refunds";
            s["returnWindowDays"] = 30;
            s["supportEmail"] = " help@palettehub.test ";
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct);
        Assert.Equal(5000, store.GetProperty("freeShippingThresholdCents").GetInt32());
        Assert.Equal("refunds", store.GetProperty("returnPolicy").GetString());
        Assert.Equal(30, store.GetProperty("returnWindowDays").GetInt32());
        Assert.Equal("help@palettehub.test", store.GetProperty("supportEmail").GetString());
        Assert.Equal(800, await ShippingQuotedForAsync(priceCents: 1000));

        await using var db = api.CreateContext();
        var entry = await db.ActivityLog.OrderByDescending(e => e.Id).FirstAsync(e => e.Action == ActivityAction.SettingsChanged, Ct);
        var changes = JsonDocument.Parse(entry.DetailsJson!).RootElement.GetProperty("changes");
        Assert.Equal(1000, changes.GetProperty("shippingFlatRateCents").GetProperty("from").GetInt32());
        Assert.Equal(800, changes.GetProperty("shippingFlatRateCents").GetProperty("to").GetInt32());
        Assert.Equal("no_returns", changes.GetProperty("returnPolicy").GetProperty("from").GetString());
        Assert.False(changes.TryGetProperty("storeName", out _));
    }

    [Fact]
    public async Task Saving_without_changes_records_nothing()
    {
        var admin = await api.CreateAdminClientAsync();
        await using var db = api.CreateContext();
        var entriesBefore = await db.ActivityLog.CountAsync(e => e.Action == ActivityAction.SettingsChanged, Ct);

        var response = await SaveAsync(admin, await GetAsync(admin), _ => { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(entriesBefore, await db.ActivityLog.CountAsync(e => e.Action == ActivityAction.SettingsChanged, Ct));
    }

    [Fact]
    public async Task Returns_need_a_number_of_days_unless_there_are_none()
    {
        var admin = await api.CreateAdminClientAsync();

        var missing = await SaveAsync(admin, await GetAsync(admin), s => s["returnPolicy"] = "exchanges");
        var ignored = await SaveAsync(admin, await GetAsync(admin), s => s["returnWindowDays"] = 30);

        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
        Assert.True((await BodyOf(missing)).GetProperty("errors").TryGetProperty("returnWindowDays", out _));
        Assert.Equal(HttpStatusCode.OK, ignored.StatusCode);
        Assert.Equal(JsonValueKind.Null, (await BodyOf(ignored)).GetProperty("returnWindowDays").ValueKind);
    }

    [Theory]
    [InlineData("timeZoneId", "Mars/Olympus_Mons")]
    [InlineData("shippingFlatRateCents", -1)]
    [InlineData("freeShippingThresholdCents", 0)]
    [InlineData("supportEmail", "not-an-email")]
    [InlineData("storeName", "")]
    public async Task Invalid_settings_are_refused_on_their_field(string field, object value)
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await SaveAsync(admin, await GetAsync(admin), s => s[field] = JsonSerializer.SerializeToNode(value));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task The_dashboards_time_zone_can_be_changed()
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await SaveAsync(admin, await GetAsync(admin), s => s["timeZoneId"] = "America/Chicago");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("America/Chicago", (await BodyOf(response)).GetProperty("timeZoneId").GetString());
    }

    // Left out, a setting would otherwise be saved as zero: free shipping, or "no returns"
    [Fact]
    public async Task A_save_that_leaves_a_setting_out_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var opened = await GetAsync(admin);

        var response = await SaveAsync(admin, opened, s => s.Remove("shippingFlatRateCents"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(1000, (await GetAsync(admin)).GetProperty("shippingFlatRateCents").GetInt32());
    }

    [Fact]
    public async Task A_save_from_an_older_copy_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var opened = await GetAsync(admin);
        await SaveAsync(admin, opened, s => s["lowStockThreshold"] = 3);

        var stale = await SaveAsync(admin, opened, s => s["lowStockThreshold"] = 8);

        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("EDIT_CONFLICT", (await BodyOf(stale)).GetProperty("code").GetString());
        Assert.Equal(3, (await GetAsync(admin)).GetProperty("lowStockThreshold").GetInt32());
    }

    private static Task<JsonElement> GetAsync(HttpClient admin) => admin.GetFromJsonAsync<JsonElement>("/api/admin/settings", Ct);

    // Saves the form as it was opened, with the given fields changed
    private static Task<HttpResponseMessage> SaveAsync(HttpClient admin, JsonElement opened, Action<JsonObject> change)
    {
        var form = JsonObject.Create(opened.Clone())!;
        form.Remove("updatedAtUtc");
        change(form);
        return admin.PutAsJsonAsync("/api/admin/settings", form, Ct);
    }

    private async Task<int> ShippingQuotedForAsync(int priceCents)
    {
        var customer = await api.CreateCustomerClientAsync();
        var productId = await api.AddProductAsync(priceCents: priceCents);
        await customer.PostAsJsonAsync("/api/cart/items", new { productId, quantity = 1 }, Ct);
        var address = await customer.PostAsJsonAsync("/api/account/addresses", new
        {
            recipientName = "Test shopper", line1 = "1 Easel Way", city = "Portland", state = "OR", postalCode = "97201", countryCode = "US",
        }, Ct);
        var addressId = (await BodyOf(address)).GetProperty("id").GetInt32();
        var quote = await customer.PostAsJsonAsync("/api/checkout", new { addressId }, Ct);
        return (await BodyOf(quote)).GetProperty("shippingCents").GetInt32();
    }

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
