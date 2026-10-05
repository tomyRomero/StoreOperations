using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Data;

// The rules SQL Server enforces on its own, so no bug in application code can break them.
// Each test tries to break one rule directly and expects the database to refuse.
public class DatabaseRulesTests(DatabaseFixture database) : IClassFixture<DatabaseFixture>
{
    private static readonly PostalAddress Address = new("Test Customer", "1 Test Street", null, "Springfield", "IL", "12345", "US");

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Stock_can_never_go_negative()
    {
        var product = await AddProductAsync(stock: 1);
        await using var db = database.CreateContext();

        // Taking more than is left, as a write that forgot to check the stock would
        var error = await SqlErrorAsync(() => db.Products
            .Where(p => p.Id == product.Id)
            .ExecuteUpdateAsync(set => set.SetProperty(p => p.Stock, p => p.Stock - 2), Ct));
        Assert.Contains("CK_Products_Stock", error.Message);
    }

    [Fact]
    public async Task A_deal_must_be_cheaper_than_the_regular_price()
    {
        var product = await AddProductAsync(priceCents: 1000);
        await using var db = database.CreateContext();
        db.Attach(product);

        product.CompareAtPriceCents = 1000;

        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("CK_Products_CompareAtPrice", error.Message);
    }

    [Fact]
    public async Task A_category_that_has_products_cannot_be_deleted()
    {
        var product = await AddProductAsync();
        await using var db = database.CreateContext();

        var error = await SqlErrorAsync(() => db.Categories.Where(c => c.Id == product.CategoryId).ExecuteDeleteAsync(Ct));
        Assert.Contains("FK_Products_Categories_CategoryId", error.Message);
    }

    [Fact]
    public async Task A_payment_can_create_only_one_order()
    {
        var user = await AddUserAsync();
        var product = await AddProductAsync();
        var paymentIntentId = $"pi_{Guid.NewGuid():N}";

        await using (var db = database.CreateContext())
        {
            db.Orders.Add(NewOrder(user.Id, product.Id, paymentIntentId));
            await db.SaveChangesAsync(Ct);
        }

        // What a retried Stripe webhook would try
        await using (var db = database.CreateContext())
        {
            db.Orders.Add(NewOrder(user.Id, product.Id, paymentIntentId));
            var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
            Assert.Contains("UX_Orders_StripePaymentIntentId", error.Message);
        }
    }

    [Fact]
    public async Task Every_order_belongs_to_an_account_or_has_a_private_link()
    {
        var product = await AddProductAsync();
        await using var db = database.CreateContext();

        db.Orders.Add(NewOrder(userId: null, product.Id));

        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("CK_Orders_Reachable", error.Message);
    }

    [Fact]
    public async Task A_checkout_is_a_customers_or_a_guests_never_both()
    {
        var user = await AddUserAsync();
        await using var db = database.CreateContext();

        var both = NewCheckout(user.Id, CheckoutStatus.Open);
        both.GuestKey = new string('a', 48);
        db.Checkouts.Add(both);

        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("CK_Checkouts_Owner", error.Message);
    }

    [Fact]
    public async Task Order_totals_must_add_up()
    {
        var user = await AddUserAsync();
        var product = await AddProductAsync();
        await using var db = database.CreateContext();

        var order = NewOrder(user.Id, product.Id);
        order.TotalCents -= 1;
        db.Orders.Add(order);

        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("CK_Orders_Amounts", error.Message);
    }

    [Fact]
    public async Task A_customer_has_at_most_one_default_address()
    {
        var user = await AddUserAsync();
        await using var db = database.CreateContext();

        db.UserAddresses.Add(new UserAddress { UserId = user.Id, Address = Address, IsDefault = true });
        db.UserAddresses.Add(new UserAddress { UserId = user.Id, Address = Address, IsDefault = false });
        await db.SaveChangesAsync(Ct);

        db.UserAddresses.Add(new UserAddress { UserId = user.Id, Address = Address, IsDefault = true });
        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("UX_UserAddresses_UserId_Default", error.Message);
    }

    [Fact]
    public async Task A_customer_has_at_most_one_open_checkout()
    {
        var user = await AddUserAsync();
        await using var db = database.CreateContext();

        // A completed checkout doesn't count, so the customer can start a new one
        db.Checkouts.Add(NewCheckout(user.Id, CheckoutStatus.Completed));
        db.Checkouts.Add(NewCheckout(user.Id, CheckoutStatus.Open));
        await db.SaveChangesAsync(Ct);

        db.Checkouts.Add(NewCheckout(user.Id, CheckoutStatus.Open));
        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("UX_Checkouts_UserId_Open", error.Message);
    }

    [Fact]
    public async Task Each_email_belongs_to_one_account_whatever_its_case()
    {
        var email = $"{Guid.NewGuid():N}@example.test";
        await AddUserAsync(email.ToLowerInvariant());

        var error = await SqlErrorAsync(() => AddUserAsync(email.ToUpperInvariant()));
        Assert.Contains("EmailIndex", error.Message);
    }

    [Fact]
    public async Task There_is_only_ever_one_settings_row()
    {
        await using var db = database.CreateContext();

        db.StoreSettings.Add(new StoreSettings { Id = 2, StoreName = "Second store", TimeZoneId = "UTC" });

        var error = await SqlErrorAsync(() => db.SaveChangesAsync(Ct));
        Assert.Contains("CK_StoreSettings_Singleton", error.Message);
    }

    // What a store that has never been set up runs on
    [Fact]
    public async Task A_new_store_starts_from_the_migrations_defaults()
    {
        await using var db = database.CreateContext();

        var settings = await db.StoreSettings.SingleAsync(Ct);

        Assert.Equal("My store", settings.StoreName);
        Assert.Equal(1000, settings.ShippingFlatRateCents);
        Assert.Null(settings.FreeShippingThresholdCents);
        Assert.Equal(ReturnPolicy.NoReturns, settings.ReturnPolicy);
        Assert.True(settings.GuestCheckout);
        Assert.Equal(StorefrontTheme.NightStudio, settings.Theme);
        Assert.Equal([HomeSection.Categories, HomeSection.NewIn, HomeSection.Newsletter], settings.HomeSections);
        Assert.Null(settings.HeroHeadline);
    }

    [Fact]
    public async Task Times_are_utc_going_in_and_coming_out()
    {
        var user = await AddUserAsync();
        var product = await AddProductAsync();

        await using (var db = database.CreateContext())
        {
            var localTime = NewOrder(user.Id, product.Id);
            localTime.PlacedAtUtc = DateTime.Now;
            db.Orders.Add(localTime);

            var error = await Assert.ThrowsAnyAsync<Exception>(() => db.SaveChangesAsync(Ct));
            Assert.Contains("Expected a UTC time", error.ToString());
        }

        await using (var db = database.CreateContext())
        {
            var saved = await db.Products.SingleAsync(p => p.Id == product.Id, Ct);
            Assert.Equal(DateTimeKind.Utc, saved.CreatedAtUtc.Kind);
        }
    }

    [Fact]
    public async Task The_migrations_match_the_model()
    {
        await using var db = database.CreateContext();

        // Fails when someone changes an entity or configuration without adding a migration
        Assert.False(db.Database.HasPendingModelChanges());
    }

    private async Task<Product> AddProductAsync(int stock = 10, int priceCents = 1000)
    {
        await using var db = database.CreateContext();
        var product = new Product
        {
            Category = new Category { Name = $"Category {Guid.NewGuid():N}", ImageKey = "test/category.jpg" },
            Name = $"Product {Guid.NewGuid():N}",
            Description = "A test product",
            PriceCents = priceCents,
            Stock = stock,
            ImageKey = "test/product.jpg",
        };
        db.Products.Add(product);
        await db.SaveChangesAsync(Ct);
        return product;
    }

    private async Task<ApplicationUser> AddUserAsync(string? email = null)
    {
        email ??= $"{Guid.NewGuid():N}@example.test";
        await using var db = database.CreateContext();
        var user = new ApplicationUser
        {
            UserName = $"user-{Guid.NewGuid():N}",
            NormalizedUserName = $"USER-{Guid.NewGuid():N}",
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString(),
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return user;
    }

    private static Order NewOrder(int? userId, int productId, string? paymentIntentId = null) => new()
    {
        OrderNumber = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
        UserId = userId,
        Email = "test@example.test",
        ShipTo = Address,
        SubtotalCents = 2000,
        ShippingCents = 1000,
        TaxCents = 150,
        TotalCents = 3150,
        StripePaymentIntentId = paymentIntentId ?? $"pi_{Guid.NewGuid():N}",
        StripeTaxCalculationId = "taxcalc_test",
        PlacedAtUtc = DateTime.UtcNow,
        Lines = [new OrderLine { ProductId = productId, ProductName = "Test", UnitPriceCents = 1000, ImageKey = "test.jpg", Quantity = 2 }],
    };

    private static Checkout NewCheckout(int userId, CheckoutStatus status) => new()
    {
        UserId = userId,
        Email = "test@example.test",
        Status = status,
        CompletedAtUtc = status == CheckoutStatus.Completed ? DateTime.UtcNow : null,
        StripePaymentIntentId = $"pi_{Guid.NewGuid():N}",
        StripeTaxCalculationId = "taxcalc_test",
        ShipTo = Address,
        SubtotalCents = 2000,
        ShippingCents = 1000,
        TaxCents = 0,
        TotalCents = 3000,
    };

    // The SQL Server error behind a failed write, whether EF wrapped it or not
    private static async Task<SqlException> SqlErrorAsync(Func<Task> write)
    {
        var exception = await Assert.ThrowsAnyAsync<Exception>(write);
        var sqlError = exception as SqlException ?? exception.InnerException as SqlException;
        Assert.NotNull(sqlError);
        return sqlError;
    }
}
