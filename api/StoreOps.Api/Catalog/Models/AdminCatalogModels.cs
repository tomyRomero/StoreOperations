using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Catalog.Models;

public sealed record CategoryRequest
{
    [Required, StringLength(50)]
    public string Name { get; init; } = "";

    // From POST /api/admin/images
    [Required, StringLength(300)]
    public string ImageKey { get; init; } = "";
}

// ProductCount counts products in the store; CanDelete is false while any product, even an archived
// one, still uses the category.
public sealed record AdminCategoryResponse(int Id, string Name, string ImageKey, string ImageUrl, int ProductCount, bool CanDelete);
