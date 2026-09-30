using StoreOps.Api.Common;

namespace StoreOps.Api.Catalog.Services;

public static class CatalogErrors
{
    public static readonly ApiError CategoryExists = new(StatusCodes.Status409Conflict, "CATEGORY_EXISTS",
        "A category with that name already exists.");

    public static readonly ApiError CategoryInUse = new(StatusCodes.Status409Conflict, "CATEGORY_IN_USE",
        "This category still has products, including archived ones, so it can't be deleted. Rename it instead.");

    public static readonly ApiError ImageNotUploaded = new(StatusCodes.Status400BadRequest, "IMAGE_NOT_UPLOADED",
        "Upload the image first.", Field: "imageKey");

    public static readonly ApiError ProductExists = new(StatusCodes.Status409Conflict, "PRODUCT_EXISTS",
        "A product in the store already has that name.");

    public static readonly ApiError ProductArchived = new(StatusCodes.Status409Conflict, "PRODUCT_ARCHIVED",
        "This product is archived. Restore it before changing it.");

    public static readonly ApiError EditConflict = new(StatusCodes.Status409Conflict, "EDIT_CONFLICT",
        "This product changed after you opened it. Reload to see the latest version, then make your change again.");

    public static readonly ApiError UnknownCategory = new(StatusCodes.Status400BadRequest, "UNKNOWN_CATEGORY",
        "Choose a category that exists.", Field: "categoryId");

    public static ApiError DealNotCheaper(int regularPriceCents) => new(StatusCodes.Status400BadRequest, "DEAL_NOT_CHEAPER",
        $"A deal price must be lower than the regular price ({Money.Format(regularPriceCents)}).", Field: "dealPriceCents");

    public static ApiError PriceNotBelowRegular(int regularPriceCents) => new(StatusCodes.Status400BadRequest, "PRICE_NOT_BELOW_REGULAR",
        $"During a deal the price must stay below the regular price ({Money.Format(regularPriceCents)}). End the deal to change the regular price.",
        Field: "priceCents");
}
