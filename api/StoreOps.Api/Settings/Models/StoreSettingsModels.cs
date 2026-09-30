using System.ComponentModel.DataAnnotations;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Settings.Models;

// What the storefront shows: the footer, the cart's free-shipping note, the returns page and "Only 3 left"
public sealed record PublicStoreSettingsResponse(
    string StoreName,
    string? SupportEmail,
    int ShippingFlatRateCents,
    int? FreeShippingThresholdCents,
    ReturnPolicy ReturnPolicy,
    short? ReturnWindowDays,
    string? ReturnPolicyNote,
    int LowStockThreshold);

public sealed record StoreSettingsResponse(
    string StoreName,
    string? SupportEmail,
    int ShippingFlatRateCents,
    int? FreeShippingThresholdCents,
    ReturnPolicy ReturnPolicy,
    short? ReturnWindowDays,
    string? ReturnPolicyNote,
    int LowStockThreshold,
    bool EmailCustomerOnStatusUpdateByDefault,
    string TimeZoneId,
    DateTime UpdatedAtUtc,
    byte[] RowVersion);

// The whole settings form, saved at once. Money is in cents; the form shows dollars.
public sealed record UpdateStoreSettingsRequest
{
    [Required, StringLength(100)]
    public string StoreName { get; init; } = "";

    // Shown to customers, and where new-order notes are sent
    [EmailAddress, StringLength(256)]
    public string? SupportEmail { get; init; }

    [Range(0, 100_000)]
    public int ShippingFlatRateCents { get; init; }

    // Null turns free shipping off
    [Range(1, 10_000_000)]
    public int? FreeShippingThresholdCents { get; init; }

    public ReturnPolicy ReturnPolicy { get; init; }

    // Required for exchanges and refunds; ignored for no returns
    [Range(1, 365)]
    public short? ReturnWindowDays { get; init; }

    [StringLength(500)]
    public string? ReturnPolicyNote { get; init; }

    [Range(0, 1000)]
    public int LowStockThreshold { get; init; }

    public bool EmailCustomerOnStatusUpdateByDefault { get; init; }

    // An IANA time zone such as America/New_York
    [Required, StringLength(64)]
    public string TimeZoneId { get; init; } = "";

    [Required, MinLength(8), MaxLength(8)]
    public byte[] RowVersion { get; init; } = [];
}
