using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Domain;
using StoreOps.Api.Orders.Models;
using StoreOps.Api.Orders.Services;

namespace StoreOps.Api.Orders.Controllers;

[Route("api/admin/orders")]
public sealed class AdminOrdersController(AdminOrderService orders) : AdminControllerBase
{
    [HttpGet]
    public async Task<Paged<AdminOrderSummaryResponse>> List(
        [FromQuery, StringLength(100)] string? search,
        [FromQuery] OrderStatus? status,
        [FromQuery] int? customerId,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken ct = default) =>
        await orders.ListAsync(new AdminOrderQuery(search, status, customerId, page, pageSize), ct);

    [HttpGet("{orderNumber}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminOrderResponse>> Get([StringLength(20)] string orderNumber, CancellationToken ct) =>
        await orders.GetAsync(orderNumber, ct) is { } order ? order : NotFound();

    // The table's bulk bar. Each order follows the same rules as on its own page; the answer says
    // which ones changed and why the others didn't.
    [HttpPost("bulk-status")]
    public async Task<BulkResult<string>> BulkStatus(BulkOrderStatusRequest request, CancellationToken ct) =>
        await orders.BulkChangeStatusAsync(request, AdminId, ct);

    [HttpPut("{orderNumber}")]
    [ProducesResponseType<AdminOrderResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Update([StringLength(20)] string orderNumber, UpdateOrderRequest request, CancellationToken ct)
    {
        var (order, error) = await orders.UpdateAsync(orderNumber, request, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(order);
    }
}
