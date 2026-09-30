using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Common;

public sealed record Paged<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    // Worked out from the others and always sent. [Required] tells the published contract so; it needs
    // a settable property, hence init.
    [Required]
    public int TotalPages { get; init; } = (TotalCount + PageSize - 1) / PageSize;
}
