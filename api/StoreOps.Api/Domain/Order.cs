namespace StoreOps.Api.Domain;

// A paid order. Created only by the Stripe webhook, from a completed checkout.
public class Order : IUpdatedAt
{
    public int Id { get; set; }

    // The number customers see, e.g. 7K3M9Q2A. Internal ids are never shown.
    public required string OrderNumber { get; set; }

    public int UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    // The current status: a copy of the newest StatusHistory entry, kept for fast filtering
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    // Where this parcel went, as it was at purchase time
    public required PostalAddress ShipTo { get; set; }

    public int SubtotalCents { get; set; }
    public int ShippingCents { get; set; }
    public int TaxCents { get; set; }
    public int TotalCents { get; set; }

    // Unique: a Stripe retry can never create a second order for the same payment
    public required string StripePaymentIntentId { get; set; }
    public required string StripeTaxCalculationId { get; set; }
    public string? StripeTaxTransactionId { get; set; }

    public Carrier? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public DateOnly? EstimatedDeliveryDate { get; set; }

    public DateTime PlacedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public List<OrderLine> Lines { get; set; } = [];
    public List<OrderStatusChange> StatusHistory { get; set; } = [];
}

public class OrderLine
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // What the customer saw and paid, fixed at purchase time
    public required string ProductName { get; set; }
    public int UnitPriceCents { get; set; }
    public required string ImageKey { get; set; }
    public int Quantity { get; set; }

    // Computed by the database: UnitPriceCents * Quantity
    public int LineTotalCents { get; private set; }
}

// One step on the order's tracking timeline
public class OrderStatusChange
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime ChangedAtUtc { get; set; }

    // Null means the system (the webhook records the first Pending step)
    public int? ChangedByUserId { get; set; }
    public ApplicationUser? ChangedBy { get; set; }

    public string? Note { get; set; }
}

public enum OrderStatus
{
    Pending,
    Shipped,
    Delivered,
    Cancelled,
    Refunded,
}

public enum Carrier
{
    Ups,
    Usps,
    FedEx,
    Dhl,
    Other,
}
