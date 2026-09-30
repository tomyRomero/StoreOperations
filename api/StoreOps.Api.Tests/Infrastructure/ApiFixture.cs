using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Tests.Infrastructure;

// The whole API running in memory against its own test database
public sealed class ApiFixture(SqlServerFixture sql, S3MockFixture s3) : DatabaseFixture(sql)
{
    // The password of every account the helpers below create
    public const string Password = "Paint-Brush-2026!";

    private Task? _demoStore;

    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    // For test classes that read the demo store: builds it the first time it's asked for, then reuses
    // it. Tests in one class run one at a time, so there is no race.
    public Task SeedDemoStoreAsync() => _demoStore ??= DevSeeder.RunAsync(Factory.Services);

    public override async ValueTask InitializeAsync()
    {
        await base.InitializeAsync();
        Factory = new ApiFactory(ConnectionString, s3.ServiceUrl);
    }

    public override async ValueTask DisposeAsync() => await Factory.DisposeAsync();

    // A new customer account, already signed in
    public async Task<HttpClient> CreateCustomerClientAsync()
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"u-{Guid.NewGuid():N}"[..20],
            email = $"{Guid.NewGuid():N}@example.test",
            password = Password,
        });
        response.EnsureSuccessStatusCode();
        return client;
    }

    // A new admin account, already signed in. The API re-reads roles from the database on every
    // request in tests, so the new role applies straight away.
    public async Task<HttpClient> CreateAdminClientAsync()
    {
        var client = await CreateCustomerClientAsync();
        var id = (await client.GetFromJsonAsync<JsonElement>("/api/auth/me")).GetProperty("id").GetInt32();

        await using var scope = Factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var added = await users.AddToRoleAsync((await users.FindByIdAsync(id.ToString(CultureInfo.InvariantCulture)))!, Roles.Admin);
        Assert.True(added.Succeeded);
        return client;
    }

    // Signs in to an existing account, such as the demo customer
    public async Task<HttpClient> SignInAsync(string email, string password)
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        response.EnsureSuccessStatusCode();
        return client;
    }

    // A product in the store (or archived), straight in the database, for tests that aren't about the catalog
    public async Task<int> AddProductAsync(int priceCents = 1000, int stock = 10, bool archived = false)
    {
        await using var db = CreateContext();
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Name == "Test supplies")
            ?? db.Categories.Add(new Category { Name = "Test supplies", ImageKey = "seed/categories/paint.jpg" }).Entity;
        var product = new Product
        {
            Category = category,
            Name = $"Test product {Guid.NewGuid():N}",
            Description = "Made for a test.",
            PriceCents = priceCents,
            Stock = stock,
            ImageKey = "seed/products/oilpaint.jpg",
            ArchivedAtUtc = archived ? DateTime.UtcNow : null,
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return product.Id;
    }

    // Uploads a tiny JPEG as the given admin and returns its key
    public async Task<string> UploadImageAsync(HttpClient admin)
    {
        var file = new ByteArrayContent([0xFF, 0xD8, 0xFF, 0xE0, .. "test image"u8]);
        file.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        var response = await admin.PostAsync("/api/admin/images", new MultipartFormDataContent { { file, "file", "test.jpg" } });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("key").GetString()!;
    }

    private sealed class ApiFactory(string connectionString, string s3ServiceUrl) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // "Testing" never loads the developer's user secrets, so a test can't reach the dev database
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:Database", connectionString);
            builder.UseSetting("Storage:ServiceUrl", s3ServiceUrl);
            builder.UseSetting("Storage:Bucket", S3MockFixture.Bucket);
            builder.UseSetting("Storage:ForcePathStyle", "true");
            builder.UseSetting("Storage:AccessKey", "test");
            builder.UseSetting("Storage:SecretKey", "test");
            // Re-check sign-in cookies on every request, so signing out other sessions is visible at once
            builder.UseSetting("Auth:SecurityStampValidationInterval", "00:00:00");
            // Every test request comes from the same in-memory address, so the per-address limit is
            // lifted here. RateLimitTests checks the limiter with a low one.
            builder.UseSetting("RateLimits:Credentials:PermitLimit", "100000");
            // Only warnings and errors, so a failing test's output isn't buried under SQL
            builder.ConfigureLogging(logging => logging.SetMinimumLevel(LogLevel.Warning));
        }
    }
}
