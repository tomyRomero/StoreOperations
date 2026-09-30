using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Catalog.Models;
using StoreOps.Api.Catalog.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Catalog.Controllers;

[Route("api/admin/categories")]
public sealed class AdminCategoriesController(CategoryAdminService categories) : AdminControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<AdminCategoryResponse>> List(CancellationToken ct) =>
        await categories.ListAsync(ct);

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminCategoryResponse>> Get(int id, CancellationToken ct) =>
        await categories.GetAsync(id, ct) is { } category ? category : NotFound();

    [HttpPost]
    [ProducesResponseType<AdminCategoryResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CategoryRequest request, CancellationToken ct)
    {
        var (category, error) = await categories.CreateAsync(request, AdminId, ct);
        return error is not null
            ? this.ErrorResponse(error)
            : CreatedAtAction(nameof(Get), new { id = category!.Id }, category);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminCategoryResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, CategoryRequest request, CancellationToken ct)
    {
        var (category, error) = await categories.UpdateAsync(id, request, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(category);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await categories.DeleteAsync(id, AdminId, ct) is { } error ? this.ErrorResponse(error) : NoContent();
}
