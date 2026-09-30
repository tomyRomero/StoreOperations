using StoreOps.Api.Domain;

namespace StoreOps.Api.Emails.Templates;

public sealed record WelcomeEmailModel(string StoreName, string? SupportEmail, string Username, string ShopUrl);

public sealed record OrderEmailLine(string Name, int Quantity, int LineTotalCents);

// Note explains a refund
public sealed record OrderEmailModel(
    string StoreName,
    string? SupportEmail,
    string OrderNumber,
    string OrderUrl,
    IReadOnlyList<OrderEmailLine> Lines,
    PostalAddress ShipTo,
    int SubtotalCents,
    int ShippingCents,
    int TaxCents,
    int TotalCents,
    string? Note);
