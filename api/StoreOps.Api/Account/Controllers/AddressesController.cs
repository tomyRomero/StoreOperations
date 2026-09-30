using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Account.Models;
using StoreOps.Api.Account.Services;
using StoreOps.Api.Auth;
using StoreOps.Api.Common;

namespace StoreOps.Api.Account.Controllers;

[ApiController]
[Route("api/account/addresses")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class AddressesController(AddressService addresses) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<AddressResponse>> List(CancellationToken ct) =>
        await addresses.ListAsync(User.GetUserId(), ct);

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AddressResponse>> Get(int id, CancellationToken ct) =>
        await addresses.GetAsync(User.GetUserId(), id, ct) is { } address ? address : NotFound();

    [HttpPost]
    [ProducesResponseType<AddressResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Add(NewAddressRequest request, CancellationToken ct)
    {
        var (address, error) = await addresses.AddAsync(User.GetUserId(), request, ct);
        return error is not null
            ? this.ErrorResponse(error)
            : CreatedAtAction(nameof(Get), new { id = address!.Id }, address);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AddressResponse>> Update(int id, AddressRequest request, CancellationToken ct) =>
        await addresses.UpdateAsync(User.GetUserId(), id, request, ct) is { } address ? address : NotFound();

    // Answers with the whole book, because the old default changes too
    [HttpPost("{id:int}/default")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<AddressResponse>>> MakeDefault(int id, CancellationToken ct) =>
        await addresses.SetDefaultAsync(User.GetUserId(), id, ct) is { } book ? Ok(book) : NotFound();

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await addresses.DeleteAsync(User.GetUserId(), id, ct) ? NoContent() : NotFound();
}
