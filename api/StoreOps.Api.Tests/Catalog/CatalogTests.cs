using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Catalog;

// Reads the demo store (13 products in 3 categories, 2 on a deal), built once for this class
public class CatalogTests(ApiFixture api) : IClassFixture<ApiFixture>, IAsyncLifetime
{
    private readonly HttpClient _client = api.Factory.CreateClient();

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await api.SeedDemoStoreAsync();

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task Categories_are_listed_by_name_with_their_image()
    {
        var categories = await GetAsync("/api/categories");

        Assert.Equal(["Brushes", "Canvas", "Paint"], categories.EnumerateArray().Select(c => c.GetProperty("name").GetString()));
        Assert.Equal("/api/images/seed/categories/brushes.png", categories[0].GetProperty("imageUrl").GetString());
    }

    [Fact]
    public async Task Products_come_newest_first_in_pages_that_never_overlap()
    {
        var pages = new List<JsonElement>();
        for (var page = 1; page <= 3; page++)
            pages.Add(await GetAsync($"/api/products?pageSize=5&page={page}"));

        Assert.Equal(13, pages[0].GetProperty("totalCount").GetInt32());
        Assert.Equal(3, pages[0].GetProperty("totalPages").GetInt32());
        Assert.Equal("Oil Paint Set", NamesIn(pages[0])[0]);
        Assert.Equal(13, pages.SelectMany(NamesIn).Distinct().Count());
    }

    [Theory]
    [InlineData("cheapest", "Fine Brush")]
    [InlineData("priciest", "Bucket Paint")]
    [InlineData("oldest", "Canvas Sign")]
    public async Task Products_can_be_sorted(string sort, string first)
    {
        var page = await GetAsync($"/api/products?sort={sort}");

        Assert.Equal(first, NamesIn(page)[0]);
    }

    [Fact]
    public async Task Products_can_be_filtered_by_one_or_more_categories()
    {
        var categories = (await GetAsync("/api/categories")).EnumerateArray()
            .ToDictionary(c => c.GetProperty("name").GetString()!, c => c.GetProperty("id").GetInt32());

        var page = await GetAsync($"/api/products?categoryId={categories["Brushes"]}&categoryId={categories["Canvas"]}");

        Assert.Equal(9, page.GetProperty("totalCount").GetInt32());
        Assert.All(page.GetProperty("items").EnumerateArray(),
            p => Assert.Contains(p.GetProperty("categoryName").GetString(), new[] { "Brushes", "Canvas" }));
    }

    [Fact]
    public async Task Search_matches_product_names_and_category_names()
    {
        var page = await GetAsync("/api/products?search=paint");

        // "Paint Roller" is a brush that matches by name; "Watercolor Set" matches through its category
        Assert.Equal(
            new[] { "Bucket Paint", "Chalk Paint", "Oil Paint Set", "Paint Roller", "Watercolor Set" },
            NamesIn(page).Order());
    }

    [Fact]
    public async Task Deals_can_be_listed_on_their_own()
    {
        var page = await GetAsync("/api/products?onDeal=true");

        Assert.Equal(new[] { "Brush Set", "Oil Paint Set" }, NamesIn(page).Order());
        var oilPaint = page.GetProperty("items").EnumerateArray().Single(p => p.GetProperty("name").GetString() == "Oil Paint Set");
        Assert.Equal(3499, oilPaint.GetProperty("priceCents").GetInt32());
        Assert.Equal(4499, oilPaint.GetProperty("compareAtPriceCents").GetInt32());
        Assert.Equal("Spring sale on oils", oilPaint.GetProperty("dealDescription").GetString());
    }

    [Fact]
    public async Task Sold_out_products_can_be_left_out()
    {
        var all = await GetAsync("/api/products?pageSize=50");
        var inStock = await GetAsync("/api/products?inStock=true&pageSize=50");

        Assert.Contains("Chalk Paint", NamesIn(all));
        Assert.DoesNotContain("Chalk Paint", NamesIn(inStock));
        Assert.Equal(12, inStock.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task Products_can_be_filtered_by_price_including_both_ends()
    {
        var page = await GetAsync("/api/products?minPriceCents=2200&maxPriceCents=2900");

        Assert.Equal(new[] { "Brush Set", "Landscape Canvas", "Watercolor Set" }, NamesIn(page).Order());
        Assert.Equal(new[] { "Fine Brush" }, NamesIn(await GetAsync("/api/products?maxPriceCents=699")));
    }

    [Fact]
    public async Task A_product_has_everything_its_page_shows()
    {
        var product = await GetAsync($"/api/products/{await IdOfAsync("Chalk Paint")}");

        Assert.Equal("Chalk Paint", product.GetProperty("name").GetString());
        Assert.StartsWith("A matte, fast-drying chalk finish", product.GetProperty("description").GetString());
        Assert.Equal(1850, product.GetProperty("priceCents").GetInt32());
        Assert.Equal(JsonValueKind.Null, product.GetProperty("compareAtPriceCents").ValueKind);
        Assert.Equal(0, product.GetProperty("stock").GetInt32());
        Assert.Equal("Paint", product.GetProperty("categoryName").GetString());
        Assert.Equal("/api/images/seed/products/chalkpaint.png", product.GetProperty("imageUrl").GetString());
    }

    [Fact]
    public async Task Archived_and_unknown_products_are_not_in_the_store()
    {
        int archivedId;
        await using (var db = api.CreateContext())
        {
            var product = new Product
            {
                CategoryId = await db.Categories.Where(c => c.Name == "Paint").Select(c => c.Id).SingleAsync(Ct),
                Name = "Retired Gouache",
                Description = "No longer sold.",
                PriceCents = 999,
                Stock = 5,
                ImageKey = "seed/products/oilpaint.jpg",
                ArchivedAtUtc = DateTime.UtcNow,
            };
            db.Products.Add(product);
            await db.SaveChangesAsync(Ct);
            archivedId = product.Id;
        }

        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/products/{archivedId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/api/products/999999", Ct)).StatusCode);
        Assert.Equal(0, (await GetAsync("/api/products?search=gouache")).GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task Related_products_come_from_the_same_category_newest_first()
    {
        var related = await GetAsync($"/api/products/{await IdOfAsync("Fine Brush")}/related");

        Assert.Equal(
            new[] { "Super Fine Brush", "Wide Brush", "Brush Set", "Paint Roller" },
            related.EnumerateArray().Select(p => p.GetProperty("name").GetString()));
    }

    [Theory]
    [InlineData("page=0", "page")]
    [InlineData("pageSize=51", "pageSize")]
    [InlineData("sort=random", "sort")]
    [InlineData("minPriceCents=-1", "minPriceCents")]
    public async Task Bad_list_options_are_field_errors(string queryString, string field)
    {
        var response = await _client.GetAsync($"/api/products?{queryString}", Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("errors");
        Assert.True(errors.TryGetProperty(field, out _), $"no error for {field}: {errors}");
    }

    private async Task<JsonElement> GetAsync(string url)
    {
        var response = await _client.GetAsync(url, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
    }

    private static List<string> NamesIn(JsonElement page) =>
        page.GetProperty("items").EnumerateArray().Select(p => p.GetProperty("name").GetString()!).ToList();

    private async Task<int> IdOfAsync(string name)
    {
        await using var db = api.CreateContext();
        return await db.Products.Where(p => p.Name == name).Select(p => p.Id).SingleAsync(Ct);
    }
}
