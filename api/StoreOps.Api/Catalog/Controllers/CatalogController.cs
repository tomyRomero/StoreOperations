using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Catalog.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Catalog.Controllers;

// The storefront's catalog. Public: browsing needs no account.
[ApiController]
[Route("api")]
[AllowAnonymous]
public sealed class CatalogController(CatalogService catalog) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<IReadOnlyList<CategoryResponse>> Categories(CancellationToken ct) =>
        await catalog.GetCategoriesAsync(ct);

    // Each option is its own query parameter, so an error names exactly what the client sent.
    // ?categoryId=1&categoryId=2 shows products in either category; search matches product and category names.
    [HttpGet("products")]
    public async Task<Paged<ProductResponse>> Products(
        [FromQuery] int[] categoryId,
        [FromQuery, StringLength(100)] string? search,
        [FromQuery] bool onDeal,
        [FromQuery] ProductSort sort = ProductSort.Newest,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 50)] int pageSize = 20,
        CancellationToken ct = default) =>
        await catalog.GetProductsAsync(new ProductQuery(categoryId, search, onDeal, sort, page, pageSize), ct);

    [HttpGet("products/{id:int}")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> Product(int id, CancellationToken ct) =>
        await catalog.GetProductAsync(id, ct) is { } product ? product : NotFound();

    [HttpGet("products/{id:int}/related")]
    [ProducesResponseType<IReadOnlyList<ProductResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> Related(
        int id, [FromQuery, Range(1, 12)] int limit = 4, CancellationToken ct = default) =>
        await catalog.GetRelatedAsync(id, limit, ct) is { } related ? Ok(related) : NotFound();
}
