namespace StoreOps.Api.Domain;

// A value, not a row of its own: copied into orders and checkouts as a snapshot,
// so editing the address book never changes where a placed order went.
public sealed record PostalAddress(
    string RecipientName,
    string Line1,
    string? Line2,
    string City,
    string? State,
    string? PostalCode,
    string CountryCode);
