using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminCategoriesTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Admins_can_create_a_category_and_the_store_shows_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var imageKey = await api.UploadImageAsync(admin);

        var response = await admin.PostAsJsonAsync("/api/admin/categories", new { name = "Pastels", imageKey }, Ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var category = await BodyOf(response);
        Assert.Equal("Pastels", category.GetProperty("name").GetString());
        Assert.Equal($"/api/images/{imageKey}", category.GetProperty("imageUrl").GetString());
        Assert.Equal(0, category.GetProperty("productCount").GetInt32());
        Assert.True(category.GetProperty("canDelete").GetBoolean());
        Assert.Equal($"/api/admin/categories/{category.GetProperty("id").GetInt32()}", response.Headers.Location?.AbsolutePath);

        var store = await api.Factory.CreateClient().GetFromJsonAsync<JsonElement>("/api/categories", Ct);
        Assert.Contains(store.EnumerateArray(), c => c.GetProperty("name").GetString() == "Pastels");
    }

    [Fact]
    public async Task Each_change_is_recorded_with_the_admin_who_made_it()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminId = (await admin.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("id").GetInt32();
        var id = await CreateAsync(admin, "Charcoal");

        await admin.PutAsJsonAsync($"/api/admin/categories/{id}", new { name = "Charcoal & Graphite", imageKey = await api.UploadImageAsync(admin) }, Ct);
        await admin.DeleteAsync($"/api/admin/categories/{id}", Ct);

        await using var db = api.CreateContext();
        var entries = await db.ActivityLog
            .Where(e => e.EntityType == ActivityEntity.Category && e.EntityId == id)
            .OrderBy(e => e.Id)
            .ToListAsync(Ct);
        Assert.Equal(
            [ActivityAction.CategoryCreated, ActivityAction.CategoryUpdated, ActivityAction.CategoryDeleted],
            entries.Select(e => e.Action));
        Assert.All(entries, e => Assert.Equal(adminId, e.ActorUserId));
        Assert.Contains("\"previousName\":\"Charcoal\"", entries[1].DetailsJson);
    }

    [Fact]
    public async Task A_name_that_is_taken_in_any_letter_case_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        await CreateAsync(admin, "Markers");

        var response = await admin.PostAsJsonAsync("/api/admin/categories",
            new { name = "  markers ", imageKey = await api.UploadImageAsync(admin) }, Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("CATEGORY_EXISTS", (await BodyOf(response)).GetProperty("code").GetString());
    }

    [Theory]
    [InlineData("images/0123456789abcdef0123456789abcdef.jpg")]
    [InlineData("https://example.test/photo.jpg")]
    public async Task An_image_that_was_never_uploaded_is_refused(string imageKey)
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await admin.PostAsJsonAsync("/api/admin/categories", new { name = $"Inks {Guid.NewGuid():N}"[..20], imageKey }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("imageKey", out _));
    }

    [Fact]
    public async Task Admins_can_rename_a_category_and_keep_its_image()
    {
        var admin = await api.CreateAdminClientAsync();
        var imageKey = await api.UploadImageAsync(admin);
        var created = await BodyOf(await admin.PostAsJsonAsync("/api/admin/categories", new { name = "Easels", imageKey }, Ct));
        var id = created.GetProperty("id").GetInt32();

        var response = await admin.PutAsJsonAsync($"/api/admin/categories/{id}", new { name = "Easels & Stands", imageKey }, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Easels & Stands", (await BodyOf(response)).GetProperty("name").GetString());
    }

    [Fact]
    public async Task Only_a_category_without_any_products_can_be_deleted()
    {
        var admin = await api.CreateAdminClientAsync();
        var inUse = await CreateAsync(admin, "Varnish");
        var empty = await CreateAsync(admin, "Palettes");
        await using (var db = api.CreateContext())
        {
            // Even an archived product keeps its category, so old orders still make sense
            db.Products.Add(new Product
            {
                CategoryId = inUse, Name = $"Old varnish {Guid.NewGuid():N}", Description = "Retired.",
                PriceCents = 500, Stock = 0, ImageKey = "seed/products/oilpaint.jpg", ArchivedAtUtc = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(Ct);
        }

        var refused = await admin.DeleteAsync($"/api/admin/categories/{inUse}", Ct);
        var deleted = await admin.DeleteAsync($"/api/admin/categories/{empty}", Ct);

        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        Assert.Equal("CATEGORY_IN_USE", (await BodyOf(refused)).GetProperty("code").GetString());
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync($"/api/admin/categories/{empty}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Unknown_categories_are_not_found()
    {
        var admin = await api.CreateAdminClientAsync();
        var imageKey = await api.UploadImageAsync(admin);

        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync("/api/admin/categories/999999", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.PutAsJsonAsync("/api/admin/categories/999999", new { name = "Nothing", imageKey }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.DeleteAsync("/api/admin/categories/999999", Ct)).StatusCode);
    }

    private async Task<int> CreateAsync(HttpClient admin, string name)
    {
        var response = await admin.PostAsJsonAsync("/api/admin/categories", new { name, imageKey = await api.UploadImageAsync(admin) }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await BodyOf(response)).GetProperty("id").GetInt32();
    }

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
