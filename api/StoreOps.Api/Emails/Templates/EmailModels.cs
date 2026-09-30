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

// A change the admin made to an order: shipped (with tracking), delivered, cancelled or refunded
public sealed record OrderStatusEmailModel(
    string StoreName,
    string? SupportEmail,
    string OrderNumber,
    string OrderUrl,
    OrderStatus Status,
    string RecipientName,
    string? CarrierName,
    string? TrackingNumber,
    string? TrackingUrl,
    DateOnly? EstimatedDelivery,
    string? Note)
{
    public string Headline => Status switch
    {
        OrderStatus.Shipped => "Your order is on its way",
        OrderStatus.Delivered => "Your order was delivered",
        OrderStatus.Cancelled => "Your order was cancelled",
        OrderStatus.Refunded => "Your order was refunded",
        _ => $"Your order is {Status.ToString().ToLowerInvariant()}",
    };
}

// The admin's plain-text newsletter. Each paragraph keeps its line breaks.
public sealed record NewsletterEmailModel(
    string StoreName, string? SupportEmail, string Subject, IReadOnlyList<string> Paragraphs, string ShopUrl, string UnsubscribeUrl);

public sealed record NewsletterWelcomeEmailModel(string StoreName, string? SupportEmail, string ShopUrl, string UnsubscribeUrl);

// A message from the contact form, for the store's inbox
public sealed record SupportRequestEmailModel(string StoreName, string Name, string Email, string Subject, string Message);
