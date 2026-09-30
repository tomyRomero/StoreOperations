using StoreOps.Api.Domain;

namespace StoreOps.Api.Orders.Models;

public sealed record OrderSummaryResponse(
    string OrderNumber,
    OrderStatus Status,
    DateTime PlacedAtUtc,
    int ItemCount,
    int TotalCents,
    string? ImageUrl);

public sealed record OrderLineResponse(int ProductId, string Name, int UnitPriceCents, int Quantity, int LineTotalCents, string ImageUrl);

// One step on the tracking timeline. The note explains a cancellation or refund.
public sealed record OrderStepResponse(OrderStatus Status, DateTime ChangedAtUtc, string? Note);

// Lines, prices and the address are as they were when the order was placed
public sealed record OrderResponse(
    string OrderNumber,
    OrderStatus Status,
    DateTime PlacedAtUtc,
    IReadOnlyList<OrderLineResponse> Lines,
    int SubtotalCents,
    int ShippingCents,
    int TaxCents,
    int TotalCents,
    PostalAddress ShipTo,
    Carrier? Carrier,
    string? TrackingNumber,
    string? TrackingUrl,
    DateOnly? EstimatedDeliveryDate,
    IReadOnlyList<OrderStepResponse> Timeline);
