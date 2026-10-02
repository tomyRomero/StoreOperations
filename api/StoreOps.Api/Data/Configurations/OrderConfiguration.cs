using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> order)
    {
        order.Property(o => o.OrderNumber).HasMaxLength(8).IsFixedLength().IsUnicode(false);
        order.Property(o => o.Email).HasMaxLength(256);
        order.Property(o => o.AccessToken).HasMaxLength(48).IsFixedLength().IsUnicode(false);
        order.ComplexProperty(o => o.ShipTo, a => a.MapAddress(prefix: "Ship"));
        order.Property(o => o.StripePaymentIntentId).HasMaxLength(255).IsUnicode(false);
        order.Property(o => o.StripeTaxCalculationId).HasMaxLength(255).IsUnicode(false);
        order.Property(o => o.StripeTaxTransactionId).HasMaxLength(255).IsUnicode(false);
        order.Property(o => o.TrackingNumber).HasMaxLength(50).IsUnicode(false);
        order.Property(o => o.PlacedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        order.Property(o => o.UpdatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        // Two admins changing the same order's status at once
        order.Property(o => o.RowVersion).IsRowVersion();

        // Restrict: customers with orders are disabled, never deleted
        order.HasOne(o => o.User).WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Restrict);
        order.HasMany(o => o.Lines).WithOne().HasForeignKey(l => l.OrderId).OnDelete(DeleteBehavior.Cascade);
        order.HasMany(o => o.StatusHistory).WithOne().HasForeignKey(h => h.OrderId).OnDelete(DeleteBehavior.Cascade);

        order.HasIndex(o => o.OrderNumber).IsUnique().HasDatabaseName("UX_Orders_OrderNumber");
        order.HasIndex(o => o.AccessToken).IsUnique().HasFilter("[AccessToken] IS NOT NULL").HasDatabaseName("UX_Orders_AccessToken");
        // Exactly one order per payment: the webhook's idempotency guarantee
        order.HasIndex(o => o.StripePaymentIntentId).IsUnique().HasDatabaseName("UX_Orders_StripePaymentIntentId");
        // A customer's orders, newest first
        order.HasIndex(o => new { o.UserId, o.PlacedAtUtc }).HasDatabaseName("IX_Orders_UserId_PlacedAtUtc");
        // The admin status filter, the "to ship" count and the orders-by-status chart
        order.HasIndex(o => new { o.Status, o.PlacedAtUtc }).HasDatabaseName("IX_Orders_Status_PlacedAtUtc");
        // Dashboard date-range figures read only this index
        order.HasIndex(o => o.PlacedAtUtc)
            .IncludeProperties(o => new { o.Status, o.SubtotalCents, o.TotalCents })
            .HasDatabaseName("IX_Orders_PlacedAtUtc");

        order.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Orders_Status", Sql.InEnum<OrderStatus>("Status"));
            t.HasCheckConstraint("CK_Orders_Carrier", $"[Carrier] IS NULL OR {Sql.InEnum<Carrier>("Carrier")}");
            t.HasCheckConstraint("CK_Orders_Amounts",
                "[SubtotalCents] >= 0 AND [ShippingCents] >= 0 AND [TaxCents] >= 0 " +
                "AND [TotalCents] = [SubtotalCents] + [ShippingCents] + [TaxCents]");
            // Its customer can always reach it: through their account, or through the private link
            t.HasCheckConstraint("CK_Orders_Reachable", "[UserId] IS NOT NULL OR [AccessToken] IS NOT NULL");
        });
    }
}

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> line)
    {
        line.HasKey(l => new { l.OrderId, l.ProductId });
        line.MapLineSnapshot();

        // Restrict: products that have sold are archived, never deleted
        line.HasOne(l => l.Product).WithMany().HasForeignKey(l => l.ProductId).OnDelete(DeleteBehavior.Restrict);

        line.ToTable(t => t.HasLineChecks("OrderLines"));
    }
}

public class OrderStatusChangeConfiguration : IEntityTypeConfiguration<OrderStatusChange>
{
    public void Configure(EntityTypeBuilder<OrderStatusChange> change)
    {
        change.ToTable("OrderStatusHistory", t =>
            t.HasCheckConstraint("CK_OrderStatusHistory_Status", Sql.InEnum<OrderStatus>("Status")));

        change.Property(h => h.Note).HasMaxLength(300);
        change.Property(h => h.ChangedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        change.HasOne(h => h.ChangedBy)
            .WithMany()
            .HasForeignKey(h => h.ChangedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // The tracking timeline, in order
        change.HasIndex(h => new { h.OrderId, h.ChangedAtUtc }).HasDatabaseName("IX_OrderStatusHistory_OrderId_ChangedAtUtc");
    }
}
