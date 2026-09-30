using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;

namespace StoreOps.Api.Catalog.Services;

// Every change is written to the activity feed in the same transaction as the change itself
public sealed class CategoryAdminService(AppDbContext db, ImageStorage images, TimeProvider clock)
{
    // Filter and sort before this projection: EF can't sort by a property of a record built by its constructor
    private static readonly Expression<Func<Category, AdminCategoryResponse>> ToResponse = c => new AdminCategoryResponse(
        c.Id, c.Name, c.ImageKey, ImageKeys.UrlFor(c.ImageKey),
        c.Products.Count(p => p.ArchivedAtUtc == null),
        !c.Products.Any());

    public async Task<IReadOnlyList<AdminCategoryResponse>> ListAsync(CancellationToken ct) =>
        await db.Categories.OrderBy(c => c.Name).Select(ToResponse).ToListAsync(ct);

    public async Task<AdminCategoryResponse?> GetAsync(int id, CancellationToken ct) =>
        await db.Categories.Where(c => c.Id == id).Select(ToResponse).SingleOrDefaultAsync(ct);

    public async Task<(AdminCategoryResponse? Category, ApiError? Error)> CreateAsync(
        CategoryRequest request, int adminId, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await CheckAsync(name, request.ImageKey, currentId: null, currentImageKey: null, ct) is { } error)
            return (null, error);

        int id;
        try
        {
            id = await db.InTransactionAsync(async () =>
            {
                var category = new Category { Name = name, ImageKey = request.ImageKey };
                db.Categories.Add(category);
                await db.SaveChangesAsync(ct);

                db.ActivityLog.Add(Activity.Entry(
                    ActivityAction.CategoryCreated, ActivityEntity.Category, category.Id, adminId, new { name }, clock));
                await db.SaveChangesAsync(ct);
                return category.Id;
            }, ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            // Created by someone else a moment ago
            return (null, CatalogErrors.CategoryExists);
        }

        return (await GetAsync(id, ct), null);
    }

    public async Task<(AdminCategoryResponse? Category, ApiError? Error)> UpdateAsync(
        int id, CategoryRequest request, int adminId, CancellationToken ct)
    {
        var category = await db.Categories.SingleOrDefaultAsync(c => c.Id == id, ct);
        if (category is null)
            return (null, ApiError.NotFound);

        var name = request.Name.Trim();
        if (await CheckAsync(name, request.ImageKey, id, category.ImageKey, ct) is { } error)
            return (null, error);

        var previousName = category.Name;
        category.Name = name;
        category.ImageKey = request.ImageKey;
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.CategoryUpdated, ActivityEntity.Category, id, adminId, new { name, previousName }, clock));

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            return (null, CatalogErrors.CategoryExists);
        }

        return (await GetAsync(id, ct), null);
    }

    public async Task<ApiError?> DeleteAsync(int id, int adminId, CancellationToken ct)
    {
        var category = await db.Categories.SingleOrDefaultAsync(c => c.Id == id, ct);
        if (category is null)
            return ApiError.NotFound;

        if (await db.Products.AnyAsync(p => p.CategoryId == id, ct))
            return CatalogErrors.CategoryInUse;

        db.Categories.Remove(category);
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.CategoryDeleted, ActivityEntity.Category, id, adminId, new { name = category.Name }, clock));

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException exception) when (exception.IsForeignKeyViolation())
        {
            // A product was added to it a moment ago
            return CatalogErrors.CategoryInUse;
        }

        return null;
    }

    // Friendly checks before saving. The unique index still decides a race between two admins.
    private async Task<ApiError?> CheckAsync(
        string name, string imageKey, int? currentId, string? currentImageKey, CancellationToken ct)
    {
        if (await db.Categories.AnyAsync(c => c.Name == name && c.Id != currentId, ct))
            return CatalogErrors.CategoryExists;

        // Only a new image needs checking; the current one is already in use
        if (imageKey != currentImageKey && !(ImageKeys.IsValid(imageKey) && await images.ExistsAsync(imageKey, ct)))
            return CatalogErrors.ImageNotUploaded;

        return null;
    }
}
