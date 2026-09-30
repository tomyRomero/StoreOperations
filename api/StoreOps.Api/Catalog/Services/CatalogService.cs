using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;

namespace StoreOps.Api.Catalog.Services;

// What the storefront reads. Archived products never appear here.
public sealed class CatalogService(AppDbContext db)
{
    private static readonly Expression<Func<Product, ProductResponse>> ToResponse = p => new ProductResponse(
        p.Id, p.Name, p.Description, p.PriceCents, p.CompareAtPriceCents, p.DealDescription, p.Stock,
        p.CategoryId, p.Category.Name, ImageKeys.UrlFor(p.ImageKey));

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken ct) =>
        await db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name, ImageKeys.UrlFor(c.ImageKey)))
            .ToListAsync(ct);

    public async Task<Paged<ProductResponse>> GetProductsAsync(ProductQuery query, CancellationToken ct)
    {
        var products = ActiveProducts();

        if (query.CategoryIds.Count > 0)
            products = products.Where(p => query.CategoryIds.Contains(p.CategoryId));

        if (query.OnDeal)
            products = products.Where(p => p.CompareAtPriceCents != null);

        if (query.Search?.Trim() is { Length: > 0 } search)
            products = products.Where(p => p.Name.Contains(search) || p.Category.Name.Contains(search));

        var totalCount = await products.CountAsync(ct);
        var items = await Sorted(products, query.Sort)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(ToResponse)
            .ToListAsync(ct);

        return new Paged<ProductResponse>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<ProductResponse?> GetProductAsync(int id, CancellationToken ct) =>
        await ActiveProducts().Where(p => p.Id == id).Select(ToResponse).SingleOrDefaultAsync(ct);

    // Other products from the same category, newest first. Null when the product isn't in the store.
    public async Task<IReadOnlyList<ProductResponse>?> GetRelatedAsync(int id, int limit, CancellationToken ct)
    {
        var categoryId = await ActiveProducts()
            .Where(p => p.Id == id)
            .Select(p => (int?)p.CategoryId)
            .SingleOrDefaultAsync(ct);
        if (categoryId is null)
            return null;

        return await Sorted(ActiveProducts().Where(p => p.CategoryId == categoryId && p.Id != id), ProductSort.Newest)
            .Take(limit)
            .Select(ToResponse)
            .ToListAsync(ct);
    }

    private IQueryable<Product> ActiveProducts() => db.Products.Where(p => p.ArchivedAtUtc == null);

    // The id breaks ties, so a product never shows up on two pages
    private static IQueryable<Product> Sorted(IQueryable<Product> products, ProductSort sort) => sort switch
    {
        ProductSort.Oldest => products.OrderBy(p => p.CreatedAtUtc).ThenBy(p => p.Id),
        ProductSort.Cheapest => products.OrderBy(p => p.PriceCents).ThenBy(p => p.Id),
        ProductSort.Priciest => products.OrderByDescending(p => p.PriceCents).ThenBy(p => p.Id),
        _ => products.OrderByDescending(p => p.CreatedAtUtc).ThenByDescending(p => p.Id),
    };
}
