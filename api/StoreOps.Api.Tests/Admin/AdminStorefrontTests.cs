using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminStorefrontTests(ApiFixture api) : IClassFixture<ApiFixture>, IAsyncLifetime
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // Every test starts from a new store's storefront: its name and nothing else filled in
    public async ValueTask InitializeAsync()
    {
        await using var db = api.CreateContext();
        var settings = await db.StoreSettings.SingleAsync(Ct);
        settings.StoreName = "My store";
        settings.Theme = StorefrontTheme.NightStudio;
        settings.Tagline = null;
        settings.LogoImageKey = null;
        settings.AccentColor = null;
        settings.ProductNoun = "product";
        settings.ProductNounPlural = "products";
        settings.HeroHeadline = null;
        settings.HomeSections = [.. StoreSettings.DefaultHomeSections];
        settings.InstagramUrl = null;
        await db.SaveChangesAsync(Ct);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task A_new_store_starts_with_its_name_the_default_rows_and_generic_words()
    {
        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct);
        var storefront = store.GetProperty("storefront");

        Assert.Equal("My store", store.GetProperty("storeName").GetString());
        Assert.Equal("night_studio", storefront.GetProperty("theme").GetString());
        Assert.Equal(["categories", "new_in", "newsletter"], storefront.GetProperty("homeSections").EnumerateArray().Select(s => s.GetString()));
        Assert.Equal("products", storefront.GetProperty("productNounPlural").GetString());
        Assert.Equal(JsonValueKind.Null, storefront.GetProperty("heroHeadline").ValueKind);
        Assert.Equal(JsonValueKind.Null, storefront.GetProperty("logoUrl").ValueKind);
    }

    [Fact]
    public async Task Published_changes_reach_the_storefront_and_are_logged()
    {
        var admin = await api.CreateAdminClientAsync();
        var logo = await api.UploadImageAsync(admin);

        var response = await SaveAsync(admin, await GetAsync(admin), s =>
        {
            s["storeName"] = " Inkwell ";
            s["theme"] = "atelier";
            s["logoImageKey"] = logo;
            s["accentColor"] = "#1f3bdb";
            s["heroHeadline"] = "Ink for every page.";
            s["homeSections"] = new JsonArray("new_in", "deals");
            s["instagramUrl"] = "https://www.instagram.com/inkwell";
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/store", Ct);
        var storefront = store.GetProperty("storefront");
        Assert.Equal("Inkwell", store.GetProperty("storeName").GetString());
        Assert.Equal("atelier", storefront.GetProperty("theme").GetString());
        Assert.Equal($"/api/images/{logo}", storefront.GetProperty("logoUrl").GetString());
        Assert.Equal("#1F3BDB", storefront.GetProperty("accentColor").GetString());
        Assert.Equal("Ink for every page.", storefront.GetProperty("heroHeadline").GetString());
        Assert.Equal(["new_in", "deals"], storefront.GetProperty("homeSections").EnumerateArray().Select(s => s.GetString()));
        Assert.Equal("https://www.instagram.com/inkwell", storefront.GetProperty("social").GetProperty("instagram").GetString());

        await using var db = api.CreateContext();
        var entry = await db.ActivityLog.OrderByDescending(e => e.Id).FirstAsync(e => e.Action == ActivityAction.SettingsChanged, Ct);
        var changes = JsonDocument.Parse(entry.DetailsJson!).RootElement.GetProperty("changes");
        Assert.Equal("My store", changes.GetProperty("storeName").GetProperty("from").GetString());
        Assert.Equal("Inkwell", changes.GetProperty("storeName").GetProperty("to").GetString());
    }

    [Theory]
    [InlineData("instagramUrl", "http://www.instagram.com/inkwell")]
    [InlineData("facebookUrl", "facebook.com/inkwell")]
    [InlineData("logoImageKey", "images/never-uploaded.png")]
    [InlineData("storeName", "")]
    [InlineData("accentColor", "violet")]
    [InlineData("productNounPlural", "")]
    public async Task Invalid_values_and_links_are_refused_on_their_field(string field, string value)
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await SaveAsync(admin, await GetAsync(admin), s => s[field] = value);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task A_row_can_appear_on_the_home_page_only_once()
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await SaveAsync(admin, await GetAsync(admin), s => s["homeSections"] = new JsonArray("deals", "deals"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("homeSections", out _));
    }

    [Fact]
    public async Task Publishing_from_an_older_copy_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var opened = await GetAsync(admin);
        await SaveAsync(admin, opened, s => s["tagline"] = "First");

        var stale = await SaveAsync(admin, opened, s => s["tagline"] = "Second");

        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("First", (await GetAsync(admin)).GetProperty("storefront").GetProperty("tagline").GetString());
    }

    private static Task<JsonElement> GetAsync(HttpClient admin) => admin.GetFromJsonAsync<JsonElement>("/api/admin/storefront", Ct);

    // Publishes the form as it was opened, with the given fields changed. The form is flat; the response
    // nests what the storefront reads under "storefront".
    private static Task<HttpResponseMessage> SaveAsync(HttpClient admin, JsonElement opened, Action<JsonObject> change)
    {
        var storefront = JsonObject.Create(opened.GetProperty("storefront").Clone())!;
        var social = storefront["social"]!.AsObject();
        var form = new JsonObject
        {
            ["storeName"] = opened.GetProperty("storeName").GetString(),
            ["logoImageKey"] = opened.GetProperty("logoImageKey").ValueKind == JsonValueKind.Null ? null : opened.GetProperty("logoImageKey").GetString(),
            ["rowVersion"] = opened.GetProperty("rowVersion").GetString(),
            ["instagramUrl"] = social["instagram"]?.DeepClone(),
            ["tikTokUrl"] = social["tikTok"]?.DeepClone(),
            ["pinterestUrl"] = social["pinterest"]?.DeepClone(),
            ["youTubeUrl"] = social["youTube"]?.DeepClone(),
            ["facebookUrl"] = social["facebook"]?.DeepClone(),
        };
        foreach (var name in new[] { "theme", "tagline", "description", "accentColor", "productNoun", "productNounPlural", "heroHeadline",
                     "heroHighlight", "heroText", "heroButtonLabel", "homeSections", "aboutText", "contactPhone", "contactAddress" })
            form[name] = storefront[name]?.DeepClone();
        change(form);
        return admin.PutAsJsonAsync("/api/admin/storefront", form, Ct);
    }

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
