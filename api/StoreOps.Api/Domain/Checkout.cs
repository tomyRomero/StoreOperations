namespace StoreOps.Api.Domain;

// A frozen quote: these items, at these prices, to this address, with this shipping and tax,
// tied to exactly one Stripe PaymentIntent. The webhook turns it into an order.
public class Checkout : ICreatedAt, IUpdatedAt
{
    public int Id { get; set; }

    // A customer's checkout, or a guest's, which is theirs through GuestKey: a random key kept in an
    // HttpOnly cookie in their browser
    public int? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string? GuestKey { get; set; }

    // Where the order's emails will go
    public required string Email { get; set; }

    public CheckoutStatus Status { get; set; } = CheckoutStatus.Open;
    public required string StripePaymentIntentId { get; set; }
    public required string StripeTaxCalculationId { get; set; }
    public required PostalAddress ShipTo { get; set; }

    public int SubtotalCents { get; set; }
    public int ShippingCents { get; set; }
    public int TaxCents { get; set; }
    public int TotalCents { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public List<CheckoutLine> Lines { get; set; } = [];
}

public class CheckoutLine
{
    public int CheckoutId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // Snapshot of what was quoted
    public required string ProductName { get; set; }
    public int UnitPriceCents { get; set; }
    public required string ImageKey { get; set; }
    public int Quantity { get; set; }

    // Computed by the database: UnitPriceCents * Quantity
    public int LineTotalCents { get; private set; }
}

public enum CheckoutStatus
{
    Open,
    Completed,
}
