using System.ComponentModel.DataAnnotations;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Orders.Models;

public sealed record AdminOrderQuery(string? Search, OrderStatus? Status, int? CustomerId, int Page, int PageSize);

public sealed record AdminOrderSummaryResponse(
    string OrderNumber,
    OrderStatus Status,
    DateTime PlacedAtUtc,
    string CustomerName,
    string CustomerEmail,
    int ItemCount,
    int TotalCents);

// ChangedBy is the admin's username, or null for the system (the webhook placing the order)
public sealed record AdminOrderStepResponse(OrderStatus Status, DateTime ChangedAtUtc, string? Note, string? ChangedBy);

public sealed record AdminOrderResponse(
    string OrderNumber,
    OrderStatus Status,
    IReadOnlyList<OrderStatus> NextStatuses,
    DateTime PlacedAtUtc,
    int CustomerId,
    string CustomerName,
    string CustomerEmail,
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
    IReadOnlyList<AdminOrderStepResponse> Timeline,
    string StripePaymentIntentId,
    byte[] RowVersion);

// The order page's side panel: the status (unchanged, or one of NextStatuses) and the shipping details
public sealed record UpdateOrderRequest
{
    public required OrderStatus Status { get; init; }

    public Carrier? Carrier { get; init; }

    [StringLength(100)]
    public string? TrackingNumber { get; init; }

    public DateOnly? EstimatedDeliveryDate { get; init; }

    // Shown to the customer on the order's timeline, e.g. why it was cancelled
    [StringLength(300)]
    public string? Note { get; init; }

    // Null follows the store's default in Store settings
    public bool? EmailCustomer { get; init; }

    // Cancelling or refunding gives the customer's money back through Stripe, so the admin must say
    // they mean it (the page asks in a dialog that shows the amount)
    public bool ConfirmRefund { get; init; }

    [Required, MinLength(8), MaxLength(8)]
    public byte[] RowVersion { get; init; } = [];
}

// An orders table's bulk bar: mark shipped, mark delivered, cancel
public sealed record BulkOrderStatusRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public string[] OrderNumbers { get; init; } = [];

    public required OrderStatus Status { get; init; }

    // Null follows the store's default in Store settings
    public bool? EmailCustomer { get; init; }

    // Required to cancel or refund: each order is refunded in full
    public bool ConfirmRefund { get; init; }
}
