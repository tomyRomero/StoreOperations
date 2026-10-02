using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoreOps.Api.Auth;
using StoreOps.Api.Checkouts.Models;
using StoreOps.Api.Checkouts.Services;
using StoreOps.Api.Common;

namespace StoreOps.Api.Checkouts.Controllers;

[ApiController]
[Route("api/checkout")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CheckoutController(CheckoutService checkout, IHostEnvironment environment) : ControllerBase
{
    // Starts checkout, or refreshes it after the cart or address changed
    [HttpPost]
    [Authorize(Policy = Policies.Shopper)]
    [ProducesResponseType<CheckoutResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Start(StartCheckoutRequest request, CancellationToken ct)
    {
        var (quote, error) = await checkout.StartAsync(User.GetUserId(), request.AddressId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(quote);
    }

    // The same for a guest. Their cookie keeps the checkout theirs, so starting again updates it.
    [HttpPost("guest")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.GuestCheckout)]
    [ProducesResponseType<CheckoutResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> StartAsGuest(GuestCheckoutRequest request, CancellationToken ct)
    {
        var (quote, guestKey, error) = await checkout.StartAsGuestAsync(request, Request.Cookies[GuestCheckoutCookie.Name], ct);
        if (error is not null)
            return this.ErrorResponse(error);

        GuestCheckoutCookie.Append(Response, guestKey!, environment);
        return Ok(quote);
    }

    // For the confirmation page Stripe returns the customer or guest to
    [HttpGet("result")]
    [AllowAnonymous]
    [ProducesResponseType<CheckoutResultResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CheckoutResultResponse>> Result(
        [FromQuery, Required, StringLength(255)] string paymentIntentId, CancellationToken ct)
    {
        var userId = User.Identity?.IsAuthenticated == true ? User.GetUserId() : (int?)null;
        return await checkout.ResultAsync(userId, Request.Cookies[GuestCheckoutCookie.Name], paymentIntentId, ct) is { } result
            ? result
            : NotFound();
    }
}
