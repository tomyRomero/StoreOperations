using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Auth;
using StoreOps.Api.Checkouts.Models;
using StoreOps.Api.Checkouts.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Checkouts.Controllers;

[ApiController]
[Route("api/checkout")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CheckoutController(CheckoutService checkout) : ControllerBase
{
    // Starts checkout, or refreshes it after the cart or address changed
    [HttpPost]
    [ProducesResponseType<CheckoutResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Start(StartCheckoutRequest request, CancellationToken ct)
    {
        var (quote, error) = await checkout.StartAsync(User.GetUserId(), request.AddressId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(quote);
    }

    // For the confirmation page Stripe returns the customer to
    [HttpGet("result")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CheckoutResultResponse>> Result(
        [FromQuery, Required, StringLength(255)] string paymentIntentId, CancellationToken ct) =>
        await checkout.ResultAsync(User.GetUserId(), paymentIntentId, ct) is { } result ? result : NotFound();
}
