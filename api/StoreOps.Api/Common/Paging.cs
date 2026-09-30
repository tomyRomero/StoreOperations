namespace StoreOps.Api.Common;

public sealed record Paged<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;
}
