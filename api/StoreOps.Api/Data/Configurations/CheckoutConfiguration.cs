using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class CheckoutConfiguration : IEntityTypeConfiguration<Checkout>
{
    public void Configure(EntityTypeBuilder<Checkout> checkout)
    {
        checkout.Property(c => c.StripePaymentIntentId).HasMaxLength(255).IsUnicode(false);
        checkout.Property(c => c.StripeTaxCalculationId).HasMaxLength(255).IsUnicode(false);
        checkout.ComplexProperty(c => c.ShipTo, a => a.MapAddress(prefix: "Ship"));
        checkout.Property(c => c.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        checkout.Property(c => c.UpdatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        // Two browser tabs updating the same checkout
        checkout.Property(c => c.RowVersion).IsRowVersion();

        checkout.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        checkout.HasMany(c => c.Lines).WithOne().HasForeignKey(l => l.CheckoutId).OnDelete(DeleteBehavior.Cascade);

        // The webhook finds the checkout from the payment
        checkout.HasIndex(c => c.StripePaymentIntentId).IsUnique().HasDatabaseName("UX_Checkouts_StripePaymentIntentId");
        checkout.HasIndex(c => c.UserId, "IX_Checkouts_UserId");
        // One open checkout per customer, and so one PaymentIntent: reloading checkout updates it
        checkout.HasIndex(c => c.UserId, "UX_Checkouts_UserId_Open")
            .IsUnique()
            .HasFilter("[Status] = 'Open'");

        checkout.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Checkouts_Status", Sql.InEnum<CheckoutStatus>("Status"));
            t.HasCheckConstraint("CK_Checkouts_Amounts",
                "[SubtotalCents] >= 0 AND [ShippingCents] >= 0 AND [TaxCents] >= 0 " +
                "AND [TotalCents] = [SubtotalCents] + [ShippingCents] + [TaxCents]");
            t.HasCheckConstraint("CK_Checkouts_Completed",
                "([Status] = 'Open' AND [CompletedAtUtc] IS NULL) OR ([Status] = 'Completed' AND [CompletedAtUtc] IS NOT NULL)");
        });
    }
}

public class CheckoutLineConfiguration : IEntityTypeConfiguration<CheckoutLine>
{
    public void Configure(EntityTypeBuilder<CheckoutLine> line)
    {
        line.HasKey(l => new { l.CheckoutId, l.ProductId });
        line.MapLineSnapshot();

        // Restrict: a quote that carries money must never silently lose a line
        line.HasOne(l => l.Product).WithMany().HasForeignKey(l => l.ProductId).OnDelete(DeleteBehavior.Restrict);

        line.ToTable(t => t.HasLineChecks("CheckoutLines"));
    }
}

internal static class LineMapping
{
    // Checkout lines and order lines share the same snapshot columns
    public static void MapLineSnapshot<TLine>(this EntityTypeBuilder<TLine> line) where TLine : class
    {
        line.Property<string>("ProductName").HasMaxLength(120);
        line.Property<string>("ImageKey").HasMaxLength(300).IsUnicode(false);
        // Calculated and stored by the database, so it can never drift from price x quantity
        line.Property<int>("LineTotalCents").HasComputedColumnSql("[UnitPriceCents] * [Quantity]", stored: true);
    }

    public static void HasLineChecks<TLine>(this TableBuilder<TLine> table, string tableName) where TLine : class
    {
        table.HasCheckConstraint($"CK_{tableName}_Quantity", "[Quantity] > 0");
        table.HasCheckConstraint($"CK_{tableName}_UnitPriceCents", "[UnitPriceCents] >= 0");
    }
}
