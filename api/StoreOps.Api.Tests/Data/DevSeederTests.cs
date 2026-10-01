using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Data;

public class DevSeederTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("Server=localhost,14330;Database=Palettehub")]
    [InlineData("Server=127.0.0.1,14330;Database=Palettehub_Test_1")]
    [InlineData("Server=tcp:localhost,14330;Database=palettehub")]
    public void Seeding_is_allowed_on_a_local_palettehub_database(string connectionString)
    {
        DevSeeder.EnsureSafeTarget(connectionString);
    }

    [Theory]
    [InlineData("Server=tcp:storeops.database.windows.net,1433;Database=Palettehub")]
    [InlineData("Server=192.168.1.20,14330;Database=Palettehub")]
    // Another project's database on this machine
    [InlineData("Server=localhost,1433;Database=Clareion")]
    [InlineData("Server=localhost,14330;Database=master")]
    public void Seeding_is_refused_anywhere_else(string connectionString)
    {
        var error = Assert.Throws<InvalidOperationException>(() => DevSeeder.EnsureSafeTarget(connectionString));
        Assert.StartsWith("Refusing to seed", error.Message);
    }

    [Fact]
    public async Task Seeding_builds_the_demo_store_and_can_be_repeated()
    {
        await DevSeeder.RunAsync(api.Factory.Services, Ct);
        await DevSeeder.RunAsync(api.Factory.Services, Ct);

        await using var scope = api.Factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        Assert.Equal(3, await db.Categories.CountAsync(Ct));
        Assert.Equal(13, await db.Products.CountAsync(Ct));
        Assert.Equal(2, await db.Products.CountAsync(p => p.CompareAtPriceCents != null, Ct));
        Assert.Equal(3, await db.Orders.CountAsync(Ct));
        Assert.Equal(2, await db.CartItems.CountAsync(Ct));
        Assert.Equal(2, await db.NewsletterSubscribers.CountAsync(Ct));

        var settings = await db.StoreSettings.SingleAsync(Ct);
        Assert.Equal(7500, settings.FreeShippingThresholdCents);
        Assert.Equal("support@palettehub.test", settings.SupportEmail);

        var admin = await users.FindByEmailAsync("admin@example.test");
        var customer = await users.FindByEmailAsync("customer@example.test");
        Assert.NotNull(admin);
        Assert.NotNull(customer);
        Assert.True(await users.IsInRoleAsync(admin, Roles.Admin));
        Assert.False(await users.IsInRoleAsync(customer, Roles.Admin));
        Assert.True(await users.CheckPasswordAsync(customer, DevSeeder.DemoPassword));

        // The delivered order has its full timeline, and its total includes $10 shipping
        var delivered = await db.Orders
            .Include(o => o.Lines)
            .Include(o => o.StatusHistory)
            .AsSplitQuery()
            .SingleAsync(o => o.OrderNumber == "SEED0001", Ct);
        Assert.Equal(OrderStatus.Delivered, delivered.Status);
        Assert.Equal(
            [OrderStatus.Pending, OrderStatus.Shipped, OrderStatus.Delivered],
            delivered.StatusHistory.OrderBy(h => h.ChangedAtUtc).Select(h => h.Status));
        Assert.Equal(delivered.Lines.Sum(l => l.LineTotalCents) + 1000, delivered.TotalCents);

        // Every product and category photo was uploaded to storage
        var images = scope.ServiceProvider.GetRequiredService<ImageStorage>();
        var imageKeys = await db.Products.Select(p => p.ImageKey).Concat(db.Categories.Select(c => c.ImageKey)).ToListAsync(Ct);
        Assert.Equal(16, imageKeys.Count);
        foreach (var key in imageKeys)
            Assert.True(await images.ExistsAsync(key, Ct), $"{key} was not uploaded");
    }
}
