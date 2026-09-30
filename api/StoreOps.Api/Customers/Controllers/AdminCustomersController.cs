using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Customers.Models;
using StoreOps.Api.Customers.Services;

namespace StoreOps.Api.Customers.Controllers;

[Route("api/admin/customers")]
public sealed class AdminCustomersController(AdminCustomerService customers) : AdminControllerBase
{
    [HttpGet]
    public async Task<Paged<AdminCustomerSummaryResponse>> List(
        [FromQuery, StringLength(100)] string? search,
        [FromQuery] AccountRole? role,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken ct = default) =>
        await customers.ListAsync(new AdminCustomerQuery(search, role, page, pageSize), ct);

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminCustomerResponse>> Get(int id, CancellationToken ct) =>
        await customers.GetAsync(id, ct) is { } customer ? customer : NotFound();

    // Signs the customer out everywhere and stops them signing in again
    [HttpPost("{id:int}/disable")]
    [ProducesResponseType<AdminCustomerResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Disable(int id, CancellationToken ct)
    {
        var (customer, error) = await customers.DisableAsync(id, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(customer);
    }

    [HttpPost("{id:int}/enable")]
    [ProducesResponseType<AdminCustomerResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Enable(int id, CancellationToken ct)
    {
        var (customer, error) = await customers.EnableAsync(id, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(customer);
    }
}
