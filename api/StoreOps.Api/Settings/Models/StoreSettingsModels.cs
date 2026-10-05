using System.ComponentModel.DataAnnotations;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Settings.Models;

// What the storefront shows: the footer, the cart's free-shipping note, the returns page and "Only 3 left",
// and its look and words. Order dates are shown in the store's time zone, the same calendar day the admin
// pages use. GuestCheckout says whether checkout asks for an account.
public sealed record PublicStoreSettingsResponse(
    string StoreName,
    string? SupportEmail,
    int ShippingFlatRateCents,
    int? FreeShippingThresholdCents,
    ReturnPolicy ReturnPolicy,
    short? ReturnWindowDays,
    string? ReturnPolicyNote,
    int LowStockThreshold,
    string TimeZoneId,
    bool GuestCheckout,
    StorefrontResponse Storefront);

// Empty text is null, and the storefront fills it from the store's name
public sealed record StorefrontResponse(
    StorefrontTheme Theme,
    string? Tagline,
    string? Description,
    string? LogoUrl,
    string? AccentColor,
    string ProductNoun,
    string ProductNounPlural,
    string? HeroHeadline,
    string? HeroHighlight,
    string? HeroText,
    string? HeroButtonLabel,
    IReadOnlyList<HomeSection> HomeSections,
    string? AboutText,
    string? ContactPhone,
    string? ContactAddress,
    SocialLinks Social);

public sealed record SocialLinks(string? Instagram, string? TikTok, string? Pinterest, string? YouTube, string? Facebook);

// Theme and brand in the console: everything the storefront shows that isn't a policy
public sealed record StorefrontSettingsResponse(
    string StoreName,
    string? LogoImageKey,
    StorefrontResponse Storefront,
    DateTime UpdatedAtUtc,
    byte[] RowVersion);

// The whole Theme and brand form, saved at once (published to the store)
public sealed record UpdateStorefrontRequest
{
    [Required, StringLength(100)]
    public string StoreName { get; init; } = "";

    public required StorefrontTheme Theme { get; init; }

    [StringLength(120)]
    public string? Tagline { get; init; }

    [StringLength(300)]
    public string? Description { get; init; }

    // From POST /api/admin/images. Null shows the theme's mark beside the name.
    [StringLength(300)]
    public string? LogoImageKey { get; init; }

    [RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "Use a color such as #5B3FD9.")]
    public string? AccentColor { get; init; }

    [Required, StringLength(40)]
    public string ProductNoun { get; init; } = "";

    [Required, StringLength(40)]
    public string ProductNounPlural { get; init; } = "";

    [StringLength(80)]
    public string? HeroHeadline { get; init; }

    [StringLength(80)]
    public string? HeroHighlight { get; init; }

    [StringLength(300)]
    public string? HeroText { get; init; }

    [StringLength(40)]
    public string? HeroButtonLabel { get; init; }

    // In order; a row that's left out is hidden
    [Required, MaxLength(4)]
    public List<HomeSection> HomeSections { get; init; } = [];

    [StringLength(4000)]
    public string? AboutText { get; init; }

    [StringLength(40)]
    public string? ContactPhone { get; init; }

    [StringLength(300)]
    public string? ContactAddress { get; init; }

    [StringLength(300)]
    public string? InstagramUrl { get; init; }

    [StringLength(300)]
    public string? TikTokUrl { get; init; }

    [StringLength(300)]
    public string? PinterestUrl { get; init; }

    [StringLength(300)]
    public string? YouTubeUrl { get; init; }

    [StringLength(300)]
    public string? FacebookUrl { get; init; }

    [Required, MinLength(8), MaxLength(8)]
    public byte[] RowVersion { get; init; } = [];
}

public sealed record StoreSettingsResponse(
    string? SupportEmail,
    int ShippingFlatRateCents,
    int? FreeShippingThresholdCents,
    ReturnPolicy ReturnPolicy,
    short? ReturnWindowDays,
    string? ReturnPolicyNote,
    int LowStockThreshold,
    bool EmailCustomerOnStatusUpdateByDefault,
    string TimeZoneId,
    bool GuestCheckout,
    DateTime UpdatedAtUtc,
    byte[] RowVersion);

// The whole settings form, saved at once. Money is in cents; the form shows dollars. The store's name
// is edited with its brand, in Theme and brand.
public sealed record UpdateStoreSettingsRequest
{
    // Shown to customers, and where new-order notes are sent
    [EmailAddress, StringLength(256)]
    public string? SupportEmail { get; init; }

    [Range(0, 100_000)]
    public required int ShippingFlatRateCents { get; init; }

    // Null turns free shipping off
    [Range(1, 10_000_000)]
    public int? FreeShippingThresholdCents { get; init; }

    public required ReturnPolicy ReturnPolicy { get; init; }

    // Required for exchanges and refunds; ignored for no returns
    [Range(1, 365)]
    public short? ReturnWindowDays { get; init; }

    [StringLength(500)]
    public string? ReturnPolicyNote { get; init; }

    [Range(0, 1000)]
    public required int LowStockThreshold { get; init; }

    public required bool EmailCustomerOnStatusUpdateByDefault { get; init; }

    // An IANA time zone such as America/New_York
    [Required, StringLength(64)]
    public string TimeZoneId { get; init; } = "";

    // Off: shoppers sign in or create an account before checkout
    public required bool GuestCheckout { get; init; }

    [Required, MinLength(8), MaxLength(8)]
    public byte[] RowVersion { get; init; } = [];
}
