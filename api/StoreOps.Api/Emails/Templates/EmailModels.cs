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
