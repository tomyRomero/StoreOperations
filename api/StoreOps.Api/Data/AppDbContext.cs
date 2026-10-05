using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>(options), IDataProtectionKeyContext
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Checkout> Checkouts => Set<Checkout>();
    public DbSet<CheckoutLine> CheckoutLines => Set<CheckoutLine>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<OrderStatusChange> OrderStatusHistory => Set<OrderStatusChange>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<ActivityLogEntry> ActivityLog => Set<ActivityLogEntry>();
    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();
    public DbSet<EmailOutboxMessage> EmailOutbox => Set<EmailOutboxMessage>();

    // The keys that encrypt the sign-in cookie (ASP.NET Core Data Protection)
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // One configuration class per table, in Data/Configurations
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        // Times: UTC, millisecond precision (the same as JavaScript's Date)
        builder.Properties<DateTime>().HavePrecision(3).HaveConversion<UtcDateTimeConverter>();

        // Enums are stored by name ("Shipped", not 1), so reordering an enum can't change what a row means
        StoreAsName<OrderStatus>(builder, 16);
        StoreAsName<CheckoutStatus>(builder, 16);
        StoreAsName<Carrier>(builder, 16);
        StoreAsName<ReturnPolicy>(builder, 16);
        StoreAsName<StorefrontTheme>(builder, 20);
        StoreAsName<EmailStatus>(builder, 16);
        StoreAsName<EmailKind>(builder, 40);
        StoreAsName<ActivityAction>(builder, 50);
        StoreAsName<ActivityEntity>(builder, 30);
    }

    private static void StoreAsName<TEnum>(ModelConfigurationBuilder builder, int maxLength) where TEnum : struct, Enum =>
        builder.Properties<TEnum>().HaveConversion<string>().HaveMaxLength(maxLength).AreUnicode(false);
}
