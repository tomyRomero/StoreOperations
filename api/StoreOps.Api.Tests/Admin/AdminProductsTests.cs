using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminProductsTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Admins_can_add_a_product_and_customers_can_find_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var request = await NewProductAsync(admin, "Gouache Set", priceCents: 2750, stock: 12);

        var response = await admin.PostAsJsonAsync("/api/admin/products", request, Ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var product = await BodyOf(response);
        var id = product.GetProperty("id").GetInt32();
        Assert.Equal($"/api/admin/products/{id}", response.Headers.Location?.AbsolutePath);

        var inStore = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>($"/api/products/{id}", Ct);
        Assert.Equal("Gouache Set", inStore.GetProperty("name").GetString());
        Assert.Equal(2750, inStore.GetProperty("priceCents").GetInt32());
        Assert.Equal(12, inStore.GetProperty("stock").GetInt32());
    }

    [Fact]
    public async Task Adding_a_product_is_recorded_with_the_admin_who_did_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminId = (await admin.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("id").GetInt32();

        var id = await CreateAsync(admin, "Palette Knife");

        await using var db = api.CreateContext();
        var entry = await db.ActivityLog.SingleAsync(e => e.EntityType == ActivityEntity.Product && e.EntityId == id, Ct);
        Assert.Equal(ActivityAction.ProductCreated, entry.Action);
        Assert.Equal(adminId, entry.ActorUserId);
        Assert.Contains("Palette Knife", entry.DetailsJson);
    }

    [Fact]
    public async Task Two_products_in_the_store_cannot_share_a_name()
    {
        var admin = await api.CreateAdminClientAsync();
        await CreateAsync(admin, "Sketchbook");

        var response = await admin.PostAsJsonAsync("/api/admin/products", await NewProductAsync(admin, "SKETCHBOOK "), Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("PRODUCT_EXISTS", await CodeOf(response));
    }

    [Fact]
    public async Task A_product_needs_a_category_that_exists()
    {
        var admin = await api.CreateAdminClientAsync();
        var request = (await NewProductAsync(admin, "Orphan Brush")) with { CategoryId = 999999 };

        var response = await admin.PostAsJsonAsync("/api/admin/products", request, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("categoryId", out _));
    }

    [Fact]
    public async Task An_edit_based_on_an_old_copy_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Masking Fluid");
        var opened = await GetAsync(admin, id);

        var first = await admin.PutAsJsonAsync($"/api/admin/products/{id}", EditOf(opened, stock: 5), Ct);
        var second = await admin.PutAsJsonAsync($"/api/admin/products/{id}", EditOf(opened, stock: 9), Ct);

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        Assert.Equal("EDIT_CONFLICT", await CodeOf(second));
        Assert.Equal(5, (await GetAsync(admin, id)).GetProperty("stock").GetInt32());
    }

    [Fact]
    public async Task A_deal_keeps_the_regular_price_as_the_was_price_until_it_ends()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Pastel Tin", priceCents: 2000);

        var started = await BodyOf(await admin.PutAsJsonAsync($"/api/admin/products/{id}/deal",
            new { dealPriceCents = 1500, description = "Autumn offer" }, Ct));
        var changed = await BodyOf(await admin.PutAsJsonAsync($"/api/admin/products/{id}/deal",
            new { dealPriceCents = 1200 }, Ct));
        var deals = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/products?onDeal=true&search=pastel", Ct);
        var ended = await BodyOf(await admin.DeleteAsync($"/api/admin/products/{id}/deal", Ct));

        Assert.Equal((1500, 2000, "Autumn offer"), PricesOf(started));
        Assert.Equal((1200, 2000, null), PricesOf(changed));
        Assert.Equal(1, deals.GetProperty("totalCount").GetInt32());
        Assert.Equal((2000, null, null), PricesOf(ended));
    }

    [Fact]
    public async Task A_deal_price_must_be_below_the_regular_price()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Linen Panel", priceCents: 2000);

        var response = await admin.PutAsJsonAsync($"/api/admin/products/{id}/deal", new { dealPriceCents = 2000 }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("dealPriceCents", out _));
    }

    [Fact]
    public async Task During_a_deal_the_price_cannot_be_raised_above_the_regular_price()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Ink Set", priceCents: 2000);
        await admin.PutAsJsonAsync($"/api/admin/products/{id}/deal", new { dealPriceCents = 1500 }, Ct);

        var response = await admin.PutAsJsonAsync($"/api/admin/products/{id}", EditOf(await GetAsync(admin, id), priceCents: 2500), Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("priceCents", out _));
    }

    [Fact]
    public async Task Archiving_takes_a_product_out_of_the_store_and_frees_its_name()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Drawing Board");

        var archived = await admin.PostAsync($"/api/admin/products/{id}/archive", null, Ct);
        var replacement = await admin.PostAsJsonAsync("/api/admin/products", await NewProductAsync(admin, "Drawing Board"), Ct);
        var restore = await admin.PostAsync($"/api/admin/products/{id}/restore", null, Ct);
        var edit = await admin.PutAsJsonAsync($"/api/admin/products/{id}", EditOf(await GetAsync(admin, id), stock: 1), Ct);

        Assert.Equal(HttpStatusCode.OK, archived.StatusCode);
        Assert.NotEqual(JsonValueKind.Null, (await BodyOf(archived)).GetProperty("archivedAtUtc").ValueKind);
        Assert.Equal(HttpStatusCode.NotFound, (await api.Factory.CreateClient().GetAsync($"/api/products/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Created, replacement.StatusCode);
        // Its name is taken again, so it can't come back, and an archived product can't be edited
        Assert.Equal("PRODUCT_EXISTS", await CodeOf(restore));
        Assert.Equal("PRODUCT_ARCHIVED", await CodeOf(edit));
    }

    [Fact]
    public async Task A_restored_product_is_back_in_the_store()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await CreateAsync(admin, "Mahl Stick");
        await admin.PostAsync($"/api/admin/products/{id}/archive", null, Ct);

        var restored = await admin.PostAsync($"/api/admin/products/{id}/restore", null, Ct);

        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await api.Factory.CreateClient().GetAsync($"/api/products/{id}", Ct)).StatusCode);
    }

    [Fact]
    public async Task The_admin_list_can_show_archived_products_and_search()
    {
        var admin = await api.CreateAdminClientAsync();
        var suffix = Guid.NewGuid().ToString("N")[..8];
        await CreateAsync(admin, $"Kept {suffix}");
        var gone = await CreateAsync(admin, $"Gone {suffix}");
        await admin.PostAsync($"/api/admin/products/{gone}/archive", null, Ct);

        var active = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/products?search={suffix}", Ct);
        var archived = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/products?search={suffix}&status=archived", Ct);
        var all = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/products?search={suffix}&status=all", Ct);

        Assert.Equal([$"Kept {suffix}"], NamesIn(active));
        Assert.Equal([$"Gone {suffix}"], NamesIn(archived));
        Assert.Equal([$"Gone {suffix}", $"Kept {suffix}"], NamesIn(all));
    }

    [Fact]
    public async Task The_admin_list_filters_by_category_stock_level_and_deal()
    {
        var admin = await api.CreateAdminClientAsync();
        var (suffix, _, low, _) = await ThreeProductsAsync(admin);
        int easels;
        await using (var db = api.CreateContext())
        {
            var category = db.Categories.Add(new Category { Name = $"Easels {suffix}", ImageKey = "seed/categories/paint.jpg" }).Entity;
            await db.SaveChangesAsync(Ct);
            easels = category.Id;
        }
        await admin.PostAsJsonAsync("/api/admin/products/bulk", new { ids = new[] { low }, action = "move", categoryId = easels }, Ct);

        // The low-stock threshold is the Store setting's default, 5
        Assert.Equal([$"Sold out {suffix}"], await NamesAsync(admin, suffix, "stock=sold_out"));
        Assert.Equal([$"Low {suffix}"], await NamesAsync(admin, suffix, "stock=low"));
        Assert.Equal([$"Plenty {suffix}"], await NamesAsync(admin, suffix, "stock=in_stock"));
        Assert.Equal([$"Plenty {suffix}"], await NamesAsync(admin, suffix, "onDeal=true"));
        Assert.Equal([$"Low {suffix}"], await NamesAsync(admin, suffix, $"categoryId={easels}"));
    }

    [Theory]
    [InlineData("", "Low", "Plenty", "Sold out")]
    [InlineData("sort=name_desc", "Sold out", "Plenty", "Low")]
    [InlineData("sort=price", "Sold out", "Plenty", "Low")]
    [InlineData("sort=price_desc", "Low", "Plenty", "Sold out")]
    [InlineData("sort=stock_desc", "Plenty", "Low", "Sold out")]
    [InlineData("sort=created_desc", "Plenty", "Low", "Sold out")]
    public async Task The_admin_list_sorts_by_any_column(string query, params string[] order)
    {
        var admin = await api.CreateAdminClientAsync();
        var (suffix, _, _, _) = await ThreeProductsAsync(admin);

        Assert.Equal(order.Select(name => $"{name} {suffix}"), await NamesAsync(admin, suffix, query));
    }

    [Fact]
    public async Task Products_are_archived_in_bulk_with_a_report_of_each()
    {
        var admin = await api.CreateAdminClientAsync();
        var first = await api.AddProductAsync();
        var second = await api.AddProductAsync();

        var response = await admin.PostAsJsonAsync("/api/admin/products/bulk",
            new { ids = new[] { first, second, 999_999 }, action = "archive" }, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await BodyOf(response);
        Assert.Equal(new[] { first, second }, result.GetProperty("succeeded").EnumerateArray().Select(id => id.GetInt32()));
        var failed = Assert.Single(result.GetProperty("failed").EnumerateArray());
        Assert.Equal((999_999, "NOT_FOUND"), (failed.GetProperty("id").GetInt32(), failed.GetProperty("code").GetString()));
        var store = api.Factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await store.GetAsync($"/api/products/{first}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await store.GetAsync($"/api/products/{second}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Deals_are_ended_in_bulk()
    {
        var admin = await api.CreateAdminClientAsync();
        var id = await api.AddProductAsync(priceCents: 1000);
        await admin.PutAsJsonAsync($"/api/admin/products/{id}/deal", new { dealPriceCents = 750 }, Ct);

        await admin.PostAsJsonAsync("/api/admin/products/bulk", new { ids = new[] { id }, action = "end_deal" }, Ct);

        var product = await GetAsync(admin, id);
        Assert.Equal(1000, product.GetProperty("priceCents").GetInt32());
        Assert.Equal(JsonValueKind.Null, product.GetProperty("compareAtPriceCents").ValueKind);
    }

    [Fact]
    public async Task Products_are_moved_to_another_category_in_bulk()
    {
        var admin = await api.CreateAdminClientAsync();
        var first = await api.AddProductAsync();
        var second = await api.AddProductAsync();
        int brushes;
        await using (var db = api.CreateContext())
        {
            var category = db.Categories.Add(new Category { Name = $"Brushes {Guid.NewGuid():N}"[..20], ImageKey = "seed/categories/paint.jpg" }).Entity;
            await db.SaveChangesAsync(Ct);
            brushes = category.Id;
        }

        var nowhere = await admin.PostAsJsonAsync("/api/admin/products/bulk", new { ids = new[] { first }, action = "move" }, Ct);
        await admin.PostAsJsonAsync("/api/admin/products/bulk", new { ids = new[] { first, second }, action = "move", categoryId = brushes }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, nowhere.StatusCode);
        Assert.True((await BodyOf(nowhere)).GetProperty("errors").TryGetProperty("categoryId", out _));
        Assert.Equal(brushes, (await GetAsync(admin, first)).GetProperty("categoryId").GetInt32());
        Assert.Equal(brushes, (await GetAsync(admin, second)).GetProperty("categoryId").GetInt32());
    }

    // Added in this order: sold out at $5, three left at $15, plenty on a deal at $7.50 (from $10)
    private async Task<(string Suffix, int SoldOut, int Low, int Plenty)> ThreeProductsAsync(HttpClient admin)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var soldOut = await api.AddProductAsync(priceCents: 500, stock: 0, name: $"Sold out {suffix}");
        var low = await api.AddProductAsync(priceCents: 1500, stock: 3, name: $"Low {suffix}");
        var plenty = await api.AddProductAsync(priceCents: 1000, stock: 20, name: $"Plenty {suffix}");
        var deal = await admin.PutAsJsonAsync($"/api/admin/products/{plenty}/deal", new { dealPriceCents = 750 }, Ct);
        Assert.Equal(HttpStatusCode.OK, deal.StatusCode);
        return (suffix, soldOut, low, plenty);
    }

    private static async Task<List<string>> NamesAsync(HttpClient admin, string suffix, string query) =>
        NamesIn(await admin.GetFromJsonAsync<JsonElement>($"/api/admin/products?search={suffix}&{query}", Ct));

    private sealed record NewProduct(string Name, string Description, int CategoryId, int PriceCents, int Stock, string ImageKey);

    private async Task<NewProduct> NewProductAsync(HttpClient admin, string name, int priceCents = 1000, int stock = 10)
    {
        int categoryId;
        await using (var db = api.CreateContext())
        {
            var category = await db.Categories.FirstOrDefaultAsync(Ct);
            if (category is null)
            {
                category = new Category { Name = "Test supplies", ImageKey = "seed/categories/paint.jpg" };
                db.Categories.Add(category);
                await db.SaveChangesAsync(Ct);
            }
            categoryId = category.Id;
        }

        return new NewProduct(name, $"About {name}.", categoryId, priceCents, stock, await api.UploadImageAsync(admin));
    }

    private async Task<int> CreateAsync(HttpClient admin, string name, int priceCents = 1000)
    {
        var response = await admin.PostAsJsonAsync("/api/admin/products", await NewProductAsync(admin, name, priceCents), Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await BodyOf(response)).GetProperty("id").GetInt32();
    }

    private static async Task<JsonElement> GetAsync(HttpClient admin, int id) =>
        await admin.GetFromJsonAsync<JsonElement>($"/api/admin/products/{id}", Ct);

    // The same product as the admin opened it, with some fields changed
    private static object EditOf(JsonElement opened, int? stock = null, int? priceCents = null) => new
    {
        name = opened.GetProperty("name").GetString(),
        description = opened.GetProperty("description").GetString(),
        categoryId = opened.GetProperty("categoryId").GetInt32(),
        priceCents = priceCents ?? opened.GetProperty("priceCents").GetInt32(),
        stock = stock ?? opened.GetProperty("stock").GetInt32(),
        imageKey = opened.GetProperty("imageKey").GetString(),
        rowVersion = opened.GetProperty("rowVersion").GetString(),
    };

    private static (int Price, int? WasPrice, string? Description) PricesOf(JsonElement product) => (
        product.GetProperty("priceCents").GetInt32(),
        product.GetProperty("compareAtPriceCents").ValueKind == JsonValueKind.Null ? null : product.GetProperty("compareAtPriceCents").GetInt32(),
        product.GetProperty("dealDescription").GetString());

    private static List<string> NamesIn(JsonElement page) =>
        page.GetProperty("items").EnumerateArray().Select(p => p.GetProperty("name").GetString()!).ToList();

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);

    private static async Task<string?> CodeOf(HttpResponseMessage response) => (await BodyOf(response)).GetProperty("code").GetString();
}
