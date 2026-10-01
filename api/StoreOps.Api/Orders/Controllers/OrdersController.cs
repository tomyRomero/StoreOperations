using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Auth;
using StoreOps.Api.Common;
using StoreOps.Api.Orders.Models;
using StoreOps.Api.Orders.Services;

namespace StoreOps.Api.Orders.Controllers;

// The signed-in customer's order history and tracking
[ApiController]
[Route("api/account/orders")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class OrdersController(OrderHistoryService orders) : ControllerBase
{
    [HttpGet]
    public async Task<Paged<OrderSummaryResponse>> List(
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 50)] int pageSize = 10,
        CancellationToken ct = default) =>
        await orders.ListAsync(User.GetUserId(), page, pageSize, ct);

    [HttpGet("{orderNumber}")]
    [ProducesResponseType<OrderResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> Get([StringLength(20)] string orderNumber, CancellationToken ct) =>
        await orders.GetAsync(User.GetUserId(), orderNumber, ct) is { } order ? order : NotFound();
}
