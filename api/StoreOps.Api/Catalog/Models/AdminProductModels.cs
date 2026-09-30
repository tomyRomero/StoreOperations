using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Catalog.Models;

public enum ProductStatus
{
    Active,
    Archived,
    All,
}

public sealed record AdminProductQuery(string? Search, ProductStatus Status, int Page, int PageSize);

public record ProductRequest
{
    [Required, StringLength(120)]
    public string Name { get; init; } = "";

    [Required, StringLength(2000)]
    public string Description { get; init; } = "";

    [Range(1, int.MaxValue)]
    public int CategoryId { get; init; }

    // What the customer pays, in cents. During a deal this is the deal price.
    [Range(1, 10_000_000)]
    public int PriceCents { get; init; }

    [Range(0, 100_000)]
    public int Stock { get; init; }

    // From POST /api/admin/images
    [Required, StringLength(300)]
    public string ImageKey { get; init; } = "";
}

public sealed record UpdateProductRequest : ProductRequest
{
    // The rowVersion the edit started from. If the product has changed since (another admin, or an
    // order taking stock), the edit is refused instead of overwriting that change.
    [Required, MinLength(8), MaxLength(8)]
    public byte[] RowVersion { get; init; } = [];
}

public sealed record DealRequest
{
    // Must be below the regular price
    [Range(1, 10_000_000)]
    public int DealPriceCents { get; init; }

    [StringLength(200)]
    public string? Description { get; init; }
}

public sealed record AdminProductResponse(
    int Id,
    string Name,
    string Description,
    int CategoryId,
    string CategoryName,
    int PriceCents,
    int? CompareAtPriceCents,
    string? DealDescription,
    int Stock,
    string ImageKey,
    string ImageUrl,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? ArchivedAtUtc,
    byte[] RowVersion);

public enum ProductBulkAction
{
    Archive,
    EndDeal,
    Move,
}

// A product table's bulk bar: archive, end deals, or move to another category
public sealed record ProductBulkRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public int[] Ids { get; init; } = [];

    public ProductBulkAction Action { get; init; }

    // Where Move puts them
    public int? CategoryId { get; init; }
}
