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
}
