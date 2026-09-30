using System.ComponentModel.DataAnnotations;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Account.Models;

public record AddressRequest
{
    [Required, StringLength(100)]
    public string RecipientName { get; init; } = "";

    [Required, StringLength(200)]
    public string Line1 { get; init; } = "";

    [StringLength(200)]
    public string? Line2 { get; init; }

    [Required, StringLength(100)]
    public string City { get; init; } = "";

    [StringLength(100)]
    public string? State { get; init; }

    [StringLength(20)]
    public string? PostalCode { get; init; }

    // ISO 3166-1 alpha-2, the format Stripe uses
    [Required, RegularExpression("^[A-Za-z]{2}$", ErrorMessage = "Use a two-letter country code, such as US.")]
    public string CountryCode { get; init; } = "";

    public PostalAddress ToPostalAddress() => new(
        RecipientName.Trim(), Line1.Trim(), OrNull(Line2), City.Trim(), OrNull(State), OrNull(PostalCode),
        CountryCode.ToUpperInvariant());

    private static string? OrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record NewAddressRequest : AddressRequest
{
    // The first address is always the default
    public bool IsDefault { get; init; }
}

public sealed record AddressResponse(
    int Id,
    string RecipientName,
    string Line1,
    string? Line2,
    string City,
    string? State,
    string? PostalCode,
    string CountryCode,
    bool IsDefault);
