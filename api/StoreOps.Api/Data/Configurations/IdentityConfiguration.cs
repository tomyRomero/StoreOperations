using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> user)
    {
        // Identity's default email index is not unique. Sign-in is by email, so the database
        // must guarantee one account per email, even when two sign-ups arrive at the same moment.
        user.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex").IsUnique();

        user.Property(u => u.StripeCustomerId).HasMaxLength(255).IsUnicode(false);
        user.HasIndex(u => u.StripeCustomerId).IsUnique().HasDatabaseName("UX_AspNetUsers_StripeCustomerId");

        user.Property(u => u.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        // The "new customers" KPI and the customer table's default sort
        user.HasIndex(u => u.CreatedAtUtc).HasDatabaseName("IX_AspNetUsers_CreatedAtUtc");
    }
}

public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole<int>>
{
    public void Configure(EntityTypeBuilder<IdentityRole<int>> role)
    {
        // Reference data every environment needs. The fixed ConcurrencyStamp stops every
        // new migration from re-updating this row.
        role.HasData(new IdentityRole<int>
        {
            Id = 1,
            Name = Roles.Admin,
            NormalizedName = Roles.Admin.ToUpperInvariant(),
            ConcurrencyStamp = "5b0f7c1e-6d3a-4b8e-9f21-3c4d5e6f7a80",
        });
    }
}
