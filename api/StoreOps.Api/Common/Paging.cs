using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Common;

public sealed record Paged<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    // Derived from the others and always sent. [Required] marks it as such in the OpenAPI contract,
    // which needs a settable property, hence init.
    [Required]
    public int TotalPages { get; init; } = (TotalCount + PageSize - 1) / PageSize;
}
