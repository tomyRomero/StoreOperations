namespace StoreOps.Api.Catalog.Models;

// One word each, so the query string value and the published contract are always the same
public enum ProductSort
{
    Newest,
    Oldest,
    Cheapest,
    Priciest,
}

// What the storefront asked for. The controller binds and validates each value from the query string.
public sealed record ProductQuery(
    IReadOnlyList<int> CategoryIds,
    string? Search,
    bool OnDeal,
    bool InStock,
    int? MinPriceCents,
    int? MaxPriceCents,
    ProductSort Sort,
    int Page,
    int PageSize);

public sealed record CategoryResponse(int Id, string Name, string ImageUrl);

// Money is in cents. CompareAtPriceCents is the struck-through "was" price, set only during a deal.
public sealed record ProductResponse(
    int Id,
    string Name,
    string Description,
    int PriceCents,
    int? CompareAtPriceCents,
    string? DealDescription,
    int Stock,
    int CategoryId,
    string CategoryName,
    string ImageUrl);
