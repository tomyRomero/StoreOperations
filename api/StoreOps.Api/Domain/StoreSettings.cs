namespace StoreOps.Api.Domain;

// Store policies the owner edits in the admin, instead of values written into code.
// Exactly one row (Id = 1), created by the first migration.
public class StoreSettings : IUpdatedAt
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public required string StoreName { get; set; }
    public string? SupportEmail { get; set; }

    public int ShippingFlatRateCents { get; set; }
    // Null means free shipping is off
    public int? FreeShippingThresholdCents { get; set; }

    public ReturnPolicy ReturnPolicy { get; set; }
    // Required unless the policy is NoReturns
    public short? ReturnWindowDays { get; set; }
    public string? ReturnPolicyNote { get; set; }

    public int LowStockThreshold { get; set; }
    public bool EmailCustomerOnStatusUpdateByDefault { get; set; }

    // IANA time zone (e.g. America/New_York): decides what "a day" means on the dashboard
    public required string TimeZoneId { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public enum ReturnPolicy
{
    NoReturns,
    Exchanges,
    Refunds,
}
