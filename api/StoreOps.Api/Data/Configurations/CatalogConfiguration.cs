using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> category)
    {
        category.Property(c => c.Name).HasMaxLength(50);
        category.Property(c => c.ImageKey).HasMaxLength(300).IsUnicode(false);
        category.Property(c => c.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        // Case-insensitive through the database collation
        category.HasIndex(c => c.Name).IsUnique().HasDatabaseName("UX_Categories_Name");
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> product)
    {
        product.Property(p => p.Name).HasMaxLength(120);
        product.Property(p => p.Description).HasMaxLength(2000);
        product.Property(p => p.DealDescription).HasMaxLength(200);
        product.Property(p => p.ImageKey).HasMaxLength(300).IsUnicode(false);
        product.Property(p => p.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        product.Property(p => p.UpdatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        product.Property(p => p.RowVersion).IsRowVersion();

        // Restrict: SQL Server refuses to delete a category that still has products
        product.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // No two live products share a name (this also stops double-submitted forms).
        // Archived products free their name for reuse.
        product.HasIndex(p => p.Name)
            .IsUnique()
            .HasFilter("[ArchivedAtUtc] IS NULL")
            .HasDatabaseName("UX_Products_Name_Active");

        product.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Products_PriceCents", "[PriceCents] > 0");
            // The database backstop for "stock never goes negative"
            t.HasCheckConstraint("CK_Products_Stock", "[Stock] >= 0");
            // A deal must be cheaper than the price it is compared with
            t.HasCheckConstraint("CK_Products_CompareAtPrice",
                "[CompareAtPriceCents] IS NULL OR [CompareAtPriceCents] > [PriceCents]");
            t.HasCheckConstraint("CK_Products_DealDescription",
                "[DealDescription] IS NULL OR [CompareAtPriceCents] IS NOT NULL");
        });
    }
}
