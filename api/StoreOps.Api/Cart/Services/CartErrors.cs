using StoreOps.Api.Common;

namespace StoreOps.Api.Cart.Services;

public static class CartErrors
{
    public static readonly ApiError ProductNotInStore = new(StatusCodes.Status404NotFound, ErrorCodes.NotFound,
        "That product isn't in the store.");

    public static readonly ApiError TooMany = new(StatusCodes.Status400BadRequest, "TOO_MANY",
        $"You can have up to {CartService.MaxQuantity} of one product in your cart.", Field: "quantity");

    public static ApiError NotEnoughStock(int stock) => new(StatusCodes.Status409Conflict, "NOT_ENOUGH_STOCK",
        stock == 0 ? "This product is out of stock." : $"Only {stock} left in stock.");
}
