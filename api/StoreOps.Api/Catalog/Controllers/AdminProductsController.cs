using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Catalog.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Catalog.Controllers;

[Route("api/admin/products")]
public sealed class AdminProductsController(ProductAdminService products) : AdminControllerBase
{
    // Sorted by name. search matches product and category names.
    [HttpGet]
    public async Task<Paged<AdminProductResponse>> List(
        [FromQuery, StringLength(100)] string? search,
        [FromQuery] ProductStatus status = ProductStatus.Active,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken ct = default) =>
        await products.ListAsync(new AdminProductQuery(search, status, page, pageSize), ct);

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminProductResponse>> Get(int id, CancellationToken ct) =>
        await products.GetAsync(id, ct) is { } product ? product : NotFound();

    [HttpPost]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(ProductRequest request, CancellationToken ct)
    {
        var (product, error) = await products.CreateAsync(request, AdminId, ct);
        return error is not null
            ? this.ErrorResponse(error)
            : CreatedAtAction(nameof(Get), new { id = product!.Id }, product);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, UpdateProductRequest request, CancellationToken ct) =>
        Respond(await products.UpdateAsync(id, request, AdminId, ct));

    // Starts a deal, or changes the price of the running one
    [HttpPut("{id:int}/deal")]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SetDeal(int id, DealRequest request, CancellationToken ct) =>
        Respond(await products.SetDealAsync(id, request, AdminId, ct));

    [HttpDelete("{id:int}/deal")]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> EndDeal(int id, CancellationToken ct) =>
        Respond(await products.EndDealAsync(id, AdminId, ct));

    [HttpPost("{id:int}/archive")]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Archive(int id, CancellationToken ct) =>
        Respond(await products.ArchiveAsync(id, AdminId, ct));

    [HttpPost("{id:int}/restore")]
    [ProducesResponseType<AdminProductResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Restore(int id, CancellationToken ct) =>
        Respond(await products.RestoreAsync(id, AdminId, ct));

    private IActionResult Respond((AdminProductResponse? Product, ApiError? Error) result) =>
        result.Error is not null ? this.ErrorResponse(result.Error) : Ok(result.Product);
}
