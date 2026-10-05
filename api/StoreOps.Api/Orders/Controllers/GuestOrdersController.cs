using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoreOps.Api.Auth;
using StoreOps.Api.Common;
using StoreOps.Api.Orders.Models;
using StoreOps.Api.Orders.Services;

namespace StoreOps.Api.Orders.Controllers;

// A guest's order, opened from the private link in its emails, and the ways back to it
[ApiController]
[Route("api/orders")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class GuestOrdersController(OrderHistoryService orders) : ControllerBase
{
    [HttpGet("{accessToken}")]
    [AllowAnonymous]
    [ProducesResponseType<GuestOrderResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GuestOrderResponse>> Get([StringLength(48)] string accessToken, CancellationToken ct) =>
        await orders.GetGuestOrderAsync(accessToken, ct) is { } order ? order : NotFound();

    // "Find your order". Answers 204 whether or not anything matched.
    [HttpPost("find")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.PublicForms)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Find(FindOrderRequest request, CancellationToken ct)
    {
        await orders.SendLinkAsync(request.Email, request.OrderNumber, ct);
        return NoContent();
    }

    // Saves the order to the signed-in account, when its email is the order's
    [HttpPost("{accessToken}/save")]
    [ProducesResponseType<SavedOrderResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SaveToAccount([StringLength(48)] string accessToken, CancellationToken ct)
    {
        var (saved, error) = await orders.SaveToAccountAsync(User.GetUserId(), accessToken, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(saved);
    }
}
