using System.ComponentModel.DataAnnotations;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Checkouts.Models;

public sealed record StartCheckoutRequest
{
    // One of the customer's saved addresses
    [Range(1, int.MaxValue)]
    public required int AddressId { get; init; }
}

public sealed record CheckoutLineResponse(int ProductId, string Name, int UnitPriceCents, int Quantity, int LineTotalCents, string ImageUrl);

// The frozen quote the customer is about to pay. ClientSecret is for Stripe's Payment Element in the browser.
public sealed record CheckoutResponse(
    int CheckoutId,
    string ClientSecret,
    IReadOnlyList<CheckoutLineResponse> Lines,
    PostalAddress ShipTo,
    int SubtotalCents,
    int ShippingCents,
    int TaxCents,
    int TotalCents);

public enum PaymentResult
{
    // Paid, and the order is being created: ask again in a moment
    Processing,
    Paid,
    // Paid, then refunded: the item sold out meanwhile, or the cart changed while paying
    Refunded,
    // Not paid: the customer can try again
    Failed,
}

public sealed record CheckoutResultResponse(PaymentResult Result, string? OrderNumber);
