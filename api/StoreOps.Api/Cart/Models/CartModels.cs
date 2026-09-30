using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Cart.Models;

public sealed record AddToCartRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, 99)]
    public int Quantity { get; init; } = 1;
}

public sealed record SetQuantityRequest
{
    [Range(1, 99)]
    public int Quantity { get; init; }
}

public sealed record CartLineRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, 99)]
    public int Quantity { get; init; }
}

// A guest's cart from the browser, to merge after sign-in or to price before it
public sealed record CartLinesRequest
{
    [Required, MaxLength(100)]
    public List<CartLineRequest> Items { get; init; } = [];
}

// Why a line can't be bought right now. Checkout stays closed while any line has one.
public enum CartLineIssue
{
    // Archived: no longer sold
    Unavailable,
    OutOfStock,
    // Fewer in stock than the quantity in the cart
    NotEnoughStock,
}

public sealed record CartLineResponse(
    int ProductId,
    string Name,
    int PriceCents,
    int? CompareAtPriceCents,
    string ImageUrl,
    int Quantity,
    int Stock,
    int LineTotalCents,
    CartLineIssue? Issue);

// Prices are today's, from the database. SubtotalCents leaves out products that are no longer sold.
public sealed record CartResponse(IReadOnlyList<CartLineResponse> Lines, int ItemCount, int SubtotalCents, bool CanCheckout);
