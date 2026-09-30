using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
{
    public void Configure(EntityTypeBuilder<UserAddress> address)
    {
        address.ComplexProperty(a => a.Address, a => a.MapAddress(prefix: ""));
        address.Property(a => a.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        address.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        address.HasIndex(a => a.UserId, "IX_UserAddresses_UserId");
        // At most one default address per customer
        address.HasIndex(a => a.UserId, "UX_UserAddresses_UserId_Default")
            .IsUnique()
            .HasFilter("[IsDefault] = 1");

        address.ToTable(t => t.HasCheckConstraint("CK_UserAddresses_CountryCode", "[CountryCode] LIKE '[A-Z][A-Z]'"));
    }
}

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> item)
    {
        // "One line per product per cart" is enforced by the key itself
        item.HasKey(i => new { i.UserId, i.ProductId });
        item.Property(i => i.AddedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        // Cart lines are disposable, so they go when the user or product goes
        item.HasOne(i => i.User).WithMany().HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Cascade);
        item.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);

        item.ToTable(t => t.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] > 0"));
    }
}

internal static class AddressMapping
{
    // The same address shape is stored inline on addresses, checkouts and orders
    public static void MapAddress(this ComplexPropertyBuilder<PostalAddress> address, string prefix)
    {
        address.Property(a => a.RecipientName).HasColumnName($"{prefix}RecipientName").HasMaxLength(100);
        address.Property(a => a.Line1).HasColumnName($"{prefix}Line1").HasMaxLength(200);
        address.Property(a => a.Line2).HasColumnName($"{prefix}Line2").HasMaxLength(200);
        address.Property(a => a.City).HasColumnName($"{prefix}City").HasMaxLength(100);
        address.Property(a => a.State).HasColumnName($"{prefix}State").HasMaxLength(100);
        address.Property(a => a.PostalCode).HasColumnName($"{prefix}PostalCode").HasMaxLength(20);
        // ISO 3166-1 alpha-2, the format Stripe uses
        address.Property(a => a.CountryCode).HasColumnName($"{prefix}CountryCode")
            .HasMaxLength(2).IsFixedLength().IsUnicode(false);
    }
}
