using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Data.Configurations;

public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> settings)
    {
        settings.Property(s => s.Id).ValueGeneratedNever();
        settings.Property(s => s.StoreName).HasMaxLength(100);
        settings.Property(s => s.SupportEmail).HasMaxLength(256);
        settings.Property(s => s.ReturnPolicyNote).HasMaxLength(500);
        settings.Property(s => s.TimeZoneId).HasMaxLength(64).IsUnicode(false);
        // Two admins saving settings at once
        settings.Property(s => s.RowVersion).IsRowVersion();

        settings.ToTable(t =>
        {
            // Exactly one settings row
            t.HasCheckConstraint("CK_StoreSettings_Singleton", $"[Id] = {StoreSettings.SingletonId}");
            t.HasCheckConstraint("CK_StoreSettings_ShippingFlatRate", "[ShippingFlatRateCents] >= 0");
            t.HasCheckConstraint("CK_StoreSettings_FreeShippingThreshold",
                "[FreeShippingThresholdCents] IS NULL OR [FreeShippingThresholdCents] > 0");
            t.HasCheckConstraint("CK_StoreSettings_ReturnPolicy", Sql.InEnum<ReturnPolicy>("ReturnPolicy"));
            t.HasCheckConstraint("CK_StoreSettings_ReturnWindow",
                "([ReturnPolicy] = 'NoReturns' AND [ReturnWindowDays] IS NULL) " +
                "OR ([ReturnPolicy] <> 'NoReturns' AND [ReturnWindowDays] BETWEEN 1 AND 365)");
            t.HasCheckConstraint("CK_StoreSettings_LowStockThreshold", "[LowStockThreshold] >= 0");
        });

        // The defaults match what the store charges today: $10 flat shipping, no free-shipping threshold
        settings.HasData(new StoreSettings
        {
            Id = StoreSettings.SingletonId,
            StoreName = "Palettehub",
            ShippingFlatRateCents = 1000,
            ReturnPolicy = ReturnPolicy.NoReturns,
            LowStockThreshold = 5,
            EmailCustomerOnStatusUpdateByDefault = false,
            TimeZoneId = "America/New_York",
            UpdatedAtUtc = new DateTime(2026, 9, 30, 0, 0, 0, DateTimeKind.Utc),
        });
    }
}

public class ActivityLogEntryConfiguration : IEntityTypeConfiguration<ActivityLogEntry>
{
    public void Configure(EntityTypeBuilder<ActivityLogEntry> entry)
    {
        entry.ToTable("ActivityLog", t =>
            t.HasCheckConstraint("CK_ActivityLog_DetailsJson", "[DetailsJson] IS NULL OR ISJSON([DetailsJson], OBJECT) = 1"));

        entry.Property(e => e.OccurredAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        entry.HasOne(e => e.Actor)
            .WithMany()
            .HasForeignKey(e => e.ActorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // The activity page and the dashboard's "recent activity", newest first
        entry.HasIndex(e => e.OccurredAtUtc).IsDescending().HasDatabaseName("IX_ActivityLog_OccurredAtUtc");
    }
}

public class NewsletterSubscriberConfiguration : IEntityTypeConfiguration<NewsletterSubscriber>
{
    public void Configure(EntityTypeBuilder<NewsletterSubscriber> subscriber)
    {
        subscriber.Property(s => s.Email).HasMaxLength(256);
        subscriber.Property(s => s.UnsubscribeToken).HasMaxLength(64).IsUnicode(false);
        subscriber.Property(s => s.SubscribedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        // No duplicate subscribers, even when two sign-ups arrive at once
        subscriber.HasIndex(s => s.Email).IsUnique().HasDatabaseName("UX_NewsletterSubscribers_Email");
        subscriber.HasIndex(s => s.UnsubscribeToken).IsUnique().HasDatabaseName("UX_NewsletterSubscribers_UnsubscribeToken");
    }
}

public class EmailOutboxMessageConfiguration : IEntityTypeConfiguration<EmailOutboxMessage>
{
    public void Configure(EntityTypeBuilder<EmailOutboxMessage> message)
    {
        message.ToTable("EmailOutbox", t =>
            t.HasCheckConstraint("CK_EmailOutbox_Status", Sql.InEnum<EmailStatus>("Status")));

        message.Property(m => m.ToAddress).HasMaxLength(256);
        message.Property(m => m.Subject).HasMaxLength(200);
        message.Property(m => m.LastError).HasMaxLength(1000);
        message.Property(m => m.CreatedAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");
        message.Property(m => m.NextAttemptAtUtc).HasDefaultValueSql("SYSUTCDATETIME()");

        // The sender's only query. Sent rows fall out of the filter, so the index stays tiny.
        message.HasIndex(m => m.NextAttemptAtUtc)
            .HasFilter("[Status] = 'Pending'")
            .HasDatabaseName("IX_EmailOutbox_Pending");
    }
}
