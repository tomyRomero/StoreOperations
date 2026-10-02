using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;

namespace StoreOps.Api.Catalog.Services;

// Products are archived, never deleted, so past orders keep their links. Every change is written to
// the activity feed in the same save as the change itself.
public sealed class ProductAdminService(AppDbContext db, ImageStorage images, TimeProvider clock)
{
    private static readonly Expression<Func<Product, AdminProductResponse>> ToResponse = p => new AdminProductResponse(
        p.Id, p.Name, p.Description, p.CategoryId, p.Category.Name, p.PriceCents, p.CompareAtPriceCents,
        p.DealDescription, p.Stock, p.ImageKey, ImageKeys.UrlFor(p.ImageKey),
        p.CreatedAtUtc, p.UpdatedAtUtc, p.ArchivedAtUtc, p.RowVersion);

    public async Task<Paged<AdminProductResponse>> ListAsync(AdminProductQuery query, CancellationToken ct)
    {
        var products = query.Status switch
        {
            ProductStatus.Archived => db.Products.Where(p => p.ArchivedAtUtc != null),
            ProductStatus.All => db.Products,
            _ => db.Products.Where(p => p.ArchivedAtUtc == null),
        };

        if (query.Search?.Trim() is { Length: > 0 } search)
            products = products.Where(p => p.Name.Contains(search) || p.Category.Name.Contains(search));

        if (query.CategoryId is { } categoryId)
            products = products.Where(p => p.CategoryId == categoryId);

        if (query.OnDeal)
            products = products.Where(p => p.CompareAtPriceCents != null);

        if (query.Stock is { } level)
        {
            var low = await db.StoreSettings.Select(s => s.LowStockThreshold).SingleAsync(ct);
            products = level switch
            {
                StockLevel.SoldOut => products.Where(p => p.Stock <= 0),
                StockLevel.Low => products.Where(p => p.Stock > 0 && p.Stock <= low),
                _ => products.Where(p => p.Stock > low),
            };
        }

        var totalCount = await products.CountAsync(ct);
        var items = await Sorted(products, query.Sort)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(ToResponse)
            .ToListAsync(ct);

        return new Paged<AdminProductResponse>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<AdminProductResponse?> GetAsync(int id, CancellationToken ct) =>
        await db.Products.Where(p => p.Id == id).Select(ToResponse).SingleOrDefaultAsync(ct);

    public async Task<(AdminProductResponse? Product, ApiError? Error)> CreateAsync(
        ProductRequest request, int adminId, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await CheckAsync(name, request, currentId: null, currentImageKey: null, ct) is { } error)
            return (null, error);

        int id;
        try
        {
            id = await db.InTransactionAsync(async () =>
            {
                var product = new Product
                {
                    Name = name,
                    Description = request.Description.Trim(),
                    CategoryId = request.CategoryId,
                    PriceCents = request.PriceCents,
                    Stock = request.Stock,
                    ImageKey = request.ImageKey,
                };
                db.Products.Add(product);
                await db.SaveChangesAsync(ct);

                db.ActivityLog.Add(Activity.Entry(
                    ActivityAction.ProductCreated, ActivityEntity.Product, product.Id, adminId, new { name }, clock));
                await db.SaveChangesAsync(ct);
                return product.Id;
            }, ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            return (null, CatalogErrors.ProductExists);
        }

        return (await GetAsync(id, ct), null);
    }

    public async Task<(AdminProductResponse? Product, ApiError? Error)> UpdateAsync(
        int id, UpdateProductRequest request, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.ArchivedAtUtc is not null)
            return (null, CatalogErrors.ProductArchived);

        var name = request.Name.Trim();
        if (await CheckAsync(name, request, id, product.ImageKey, ct) is { } error)
            return (null, error);

        // During a deal, the price field is the deal price and must stay below the regular price
        if (product.CompareAtPriceCents is { } regular && request.PriceCents >= regular)
            return (null, CatalogErrors.PriceNotBelowRegular(regular));

        // Saving checks this against the row, so an edit based on an older copy is refused
        db.Entry(product).Property(p => p.RowVersion).OriginalValue = request.RowVersion;

        product.Name = name;
        product.Description = request.Description.Trim();
        product.CategoryId = request.CategoryId;
        product.PriceCents = request.PriceCents;
        product.Stock = request.Stock;
        product.ImageKey = request.ImageKey;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.ProductUpdated, ActivityEntity.Product, id, adminId, new { name }, clock));

        return await SaveAsync(product, ct);
    }

    // Starts a deal, or changes the price of the running one. The regular price is kept as the
    // struck-through "was" price.
    public async Task<(AdminProductResponse? Product, ApiError? Error)> SetDealAsync(
        int id, DealRequest request, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.ArchivedAtUtc is not null)
            return (null, CatalogErrors.ProductArchived);

        var regular = product.CompareAtPriceCents ?? product.PriceCents;
        if (request.DealPriceCents >= regular)
            return (null, CatalogErrors.DealNotCheaper(regular));

        var starting = product.CompareAtPriceCents is null;
        product.CompareAtPriceCents = regular;
        product.PriceCents = request.DealPriceCents;
        product.DealDescription = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        db.ActivityLog.Add(Activity.Entry(
            starting ? ActivityAction.DealStarted : ActivityAction.ProductUpdated, ActivityEntity.Product, id, adminId,
            new { name = product.Name, dealPriceCents = request.DealPriceCents, regularPriceCents = regular }, clock));

        return await SaveAsync(product, ct);
    }

    // Puts the regular price back. Ending a deal that isn't running changes nothing.
    public async Task<(AdminProductResponse? Product, ApiError? Error)> EndDealAsync(int id, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.CompareAtPriceCents is not { } regular)
            return (await GetAsync(id, ct), null);

        product.PriceCents = regular;
        product.CompareAtPriceCents = null;
        product.DealDescription = null;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.DealEnded, ActivityEntity.Product, id, adminId, new { name = product.Name }, clock));

        return await SaveAsync(product, ct);
    }

    // Takes the product out of the store and frees its name. Archiving twice changes nothing.
    public async Task<(AdminProductResponse? Product, ApiError? Error)> ArchiveAsync(int id, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.ArchivedAtUtc is not null)
            return (await GetAsync(id, ct), null);

        product.ArchivedAtUtc = clock.GetUtcNow().UtcDateTime;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.ProductArchived, ActivityEntity.Product, id, adminId, new { name = product.Name }, clock));

        return await SaveAsync(product, ct);
    }

    // Moves the product to another category. Moving it where it already is changes nothing.
    public async Task<(AdminProductResponse? Product, ApiError? Error)> MoveAsync(
        int id, int categoryId, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.ArchivedAtUtc is not null)
            return (null, CatalogErrors.ProductArchived);
        if (product.CategoryId == categoryId)
            return (await GetAsync(id, ct), null);
        if (!await db.Categories.AnyAsync(c => c.Id == categoryId, ct))
            return (null, CatalogErrors.UnknownCategory);

        product.CategoryId = categoryId;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.ProductUpdated, ActivityEntity.Product, id, adminId, new { name = product.Name, categoryId }, clock));

        return await SaveAsync(product, ct);
    }

    // The same actions for many products at once, with a report of what each one did
    public async Task<(BulkResult<int>? Result, ApiError? Error)> BulkAsync(ProductBulkRequest request, int adminId, CancellationToken ct)
    {
        if (request.Action == ProductBulkAction.Move)
        {
            if (request.CategoryId is not { } categoryId || !await db.Categories.AnyAsync(c => c.Id == categoryId, ct))
                return (null, CatalogErrors.UnknownCategory);
        }

        var result = await Bulk.RunAsync(db, request.Ids, async id => (request.Action switch
        {
            ProductBulkAction.Archive => await ArchiveAsync(id, adminId, ct),
            ProductBulkAction.EndDeal => await EndDealAsync(id, adminId, ct),
            _ => await MoveAsync(id, request.CategoryId!.Value, adminId, ct),
        }).Error);
        return (result, null);
    }

    // Puts an archived product back in the store, unless another product has taken its name
    public async Task<(AdminProductResponse? Product, ApiError? Error)> RestoreAsync(int id, int adminId, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
            return (null, ApiError.NotFound);
        if (product.ArchivedAtUtc is null)
            return (await GetAsync(id, ct), null);

        if (await NameInUseAsync(product.Name, id, ct))
            return (null, CatalogErrors.ProductExists);

        product.ArchivedAtUtc = null;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.ProductRestored, ActivityEntity.Product, id, adminId, new { name = product.Name }, clock));

        return await SaveAsync(product, ct);
    }

    private async Task<(AdminProductResponse? Product, ApiError? Error)> SaveAsync(Product product, CancellationToken ct)
    {
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return (null, CatalogErrors.EditConflict);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            return (null, CatalogErrors.ProductExists);
        }

        return (await GetAsync(product.Id, ct), null);
    }

    // Friendly checks before saving. The unique index still decides a race between two admins.
    private async Task<ApiError?> CheckAsync(
        string name, ProductRequest request, int? currentId, string? currentImageKey, CancellationToken ct)
    {
        if (await NameInUseAsync(name, currentId, ct))
            return CatalogErrors.ProductExists;

        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId, ct))
            return CatalogErrors.UnknownCategory;

        // Only a new image needs checking; the current one is already in use
        if (request.ImageKey != currentImageKey
            && !(ImageKeys.IsValid(request.ImageKey) && await images.ExistsAsync(request.ImageKey, ct)))
            return CatalogErrors.ImageNotUploaded;

        return null;
    }

    // The id breaks ties, so a product never shows up on two pages
    private static IQueryable<Product> Sorted(IQueryable<Product> products, AdminProductSort sort) => sort switch
    {
        AdminProductSort.NameDesc => products.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
        AdminProductSort.Price => products.OrderBy(p => p.PriceCents).ThenBy(p => p.Id),
        AdminProductSort.PriceDesc => products.OrderByDescending(p => p.PriceCents).ThenBy(p => p.Id),
        AdminProductSort.Stock => products.OrderBy(p => p.Stock).ThenBy(p => p.Id),
        AdminProductSort.StockDesc => products.OrderByDescending(p => p.Stock).ThenBy(p => p.Id),
        AdminProductSort.Created => products.OrderBy(p => p.CreatedAtUtc).ThenBy(p => p.Id),
        AdminProductSort.CreatedDesc => products.OrderByDescending(p => p.CreatedAtUtc).ThenByDescending(p => p.Id),
        _ => products.OrderBy(p => p.Name).ThenBy(p => p.Id),
    };

    // Names are unique among products in the store; archived products don't count
    private Task<bool> NameInUseAsync(string name, int? exceptId, CancellationToken ct) =>
        db.Products.AnyAsync(p => p.Name == name && p.ArchivedAtUtc == null && p.Id != exceptId, ct);
}
