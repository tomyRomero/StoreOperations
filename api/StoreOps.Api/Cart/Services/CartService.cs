using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Cart.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;

namespace StoreOps.Api.Cart.Services;

// A signed-in customer's cart. Every price comes from the database at the time it's read, so a
// cart never shows a stale price; checkout prices it again.
public sealed class CartService(AppDbContext db, TimeProvider clock)
{
    public const int MaxQuantity = 99;

    private sealed record ProductData(
        int Id, string Name, int PriceCents, int? CompareAtPriceCents, string ImageKey, int Stock, bool Archived);

    public async Task<CartResponse> GetAsync(int userId, CancellationToken ct)
    {
        var lines = await db.CartItems
            .Where(i => i.UserId == userId)
            .OrderBy(i => i.AddedAtUtc).ThenBy(i => i.ProductId)
            .Select(i => new
            {
                i.Quantity,
                Product = new ProductData(i.Product.Id, i.Product.Name, i.Product.PriceCents, i.Product.CompareAtPriceCents,
                    i.Product.ImageKey, i.Product.Stock, i.Product.ArchivedAtUtc != null),
            })
            .ToListAsync(ct);

        return Build(lines.Select(l => (l.Product, l.Quantity)));
    }

    // Adds to what's already in the cart
    public async Task<(CartResponse? Cart, ApiError? Error)> AddAsync(int userId, int productId, int quantity, CancellationToken ct)
    {
        var current = await db.CartItems
            .Where(i => i.UserId == userId && i.ProductId == productId)
            .Select(i => (int?)i.Quantity)
            .SingleOrDefaultAsync(ct);

        return await SetQuantityAsync(userId, productId, (current ?? 0) + quantity, ct);
    }

    public async Task<(CartResponse? Cart, ApiError? Error)> SetQuantityAsync(
        int userId, int productId, int quantity, CancellationToken ct)
    {
        if (quantity > MaxQuantity)
            return (null, CartErrors.TooMany);

        var stock = await db.Products
            .Where(p => p.Id == productId && p.ArchivedAtUtc == null)
            .Select(p => (int?)p.Stock)
            .SingleOrDefaultAsync(ct);
        if (stock is null)
            return (null, CartErrors.ProductNotInStore);
        if (quantity > stock)
            return (null, CartErrors.NotEnoughStock(stock.Value));

        var item = await db.CartItems.SingleOrDefaultAsync(i => i.UserId == userId && i.ProductId == productId, ct);
        if (item is null)
            db.CartItems.Add(new CartItem { UserId = userId, ProductId = productId, Quantity = quantity, AddedAtUtc = Now });
        else
            item.Quantity = quantity;

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            // The same product was added from another tab a moment ago; its line wins
            db.ChangeTracker.Clear();
        }

        return (await GetAsync(userId, ct), null);
    }

    public async Task<CartResponse> RemoveAsync(int userId, int productId, CancellationToken ct)
    {
        await db.CartItems.Where(i => i.UserId == userId && i.ProductId == productId).ExecuteDeleteAsync(ct);
        return await GetAsync(userId, ct);
    }

    // After sign-in: the browser's guest cart joins the saved one. For a product in both, the larger
    // quantity wins, limited to what's in stock. Products no longer sold are skipped.
    public async Task<CartResponse> MergeAsync(int userId, IReadOnlyList<CartLineRequest> guestLines, CancellationToken ct)
    {
        var wanted = Wanted(guestLines);
        var ids = wanted.Keys.ToList();
        var stock = await db.Products
            .Where(p => ids.Contains(p.Id) && p.ArchivedAtUtc == null)
            .Select(p => new { p.Id, p.Stock })
            .ToDictionaryAsync(p => p.Id, p => p.Stock, ct);
        var saved = await db.CartItems
            .Where(i => i.UserId == userId && ids.Contains(i.ProductId))
            .ToDictionaryAsync(i => i.ProductId, ct);

        foreach (var (productId, quantity) in wanted)
        {
            if (!stock.TryGetValue(productId, out var inStock) || inStock == 0)
                continue;

            var merged = Math.Min(quantity, inStock);
            if (saved.TryGetValue(productId, out var item))
                item.Quantity = Math.Max(item.Quantity, merged);
            else
                db.CartItems.Add(new CartItem { UserId = userId, ProductId = productId, Quantity = merged, AddedAtUtc = Now });
        }

        await db.SaveChangesAsync(ct);
        return await GetAsync(userId, ct);
    }

    // Prices a guest's cart with the same rules as a saved one, without saving anything
    public async Task<CartResponse> PreviewAsync(IReadOnlyList<CartLineRequest> guestLines, CancellationToken ct)
    {
        var wanted = Wanted(guestLines);
        var ids = wanted.Keys.ToList();
        var products = await db.Products
            .Where(p => ids.Contains(p.Id))
            .Select(p => new ProductData(p.Id, p.Name, p.PriceCents, p.CompareAtPriceCents, p.ImageKey, p.Stock, p.ArchivedAtUtc != null))
            .ToDictionaryAsync(p => p.Id, ct);

        return Build(wanted
            .Where(w => products.ContainsKey(w.Key))
            .Select(w => (products[w.Key], w.Value)));
    }

    private DateTime Now => clock.GetUtcNow().UtcDateTime;

    // One quantity per product, in the order the browser listed them
    private static Dictionary<int, int> Wanted(IReadOnlyList<CartLineRequest> lines)
    {
        var wanted = new Dictionary<int, int>();
        foreach (var line in lines)
            wanted[line.ProductId] = Math.Max(wanted.GetValueOrDefault(line.ProductId), line.Quantity);
        return wanted;
    }

    private static CartResponse Build(IEnumerable<(ProductData Product, int Quantity)> lines)
    {
        var responses = lines.Select(l => new CartLineResponse(
            l.Product.Id,
            l.Product.Name,
            l.Product.PriceCents,
            l.Product.CompareAtPriceCents,
            ImageKeys.UrlFor(l.Product.ImageKey),
            l.Quantity,
            l.Product.Stock,
            l.Product.PriceCents * l.Quantity,
            IssueOf(l.Product, l.Quantity))).ToList();

        return new CartResponse(
            responses,
            ItemCount: responses.Sum(l => l.Quantity),
            SubtotalCents: responses.Where(l => l.Issue != CartLineIssue.Unavailable).Sum(l => l.LineTotalCents),
            CanCheckout: responses.Count > 0 && responses.All(l => l.Issue is null));
    }

    private static CartLineIssue? IssueOf(ProductData product, int quantity) =>
        product.Archived ? CartLineIssue.Unavailable
        : product.Stock == 0 ? CartLineIssue.OutOfStock
        : quantity > product.Stock ? CartLineIssue.NotEnoughStock
        : null;
}
