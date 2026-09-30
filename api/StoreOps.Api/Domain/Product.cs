namespace StoreOps.Api.Domain;

public class Product : ICreatedAt, IUpdatedAt
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public required string Name { get; set; }
    public required string Description { get; set; }

    // What the customer pays now, in cents
    public int PriceCents { get; set; }

    // The struck-through "was" price. Null means the product is not on a deal.
    public int? CompareAtPriceCents { get; set; }
    public string? DealDescription { get; set; }

    public int Stock { get; set; }
    public required string ImageKey { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    // Products are archived, never deleted, so past orders keep their links. Null means active.
    public DateTime? ArchivedAtUtc { get; set; }

    public byte[] RowVersion { get; set; } = [];
}
