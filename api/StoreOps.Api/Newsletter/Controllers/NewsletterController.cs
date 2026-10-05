using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoreOps.Api.Common;
using StoreOps.Api.Newsletter.Models;
using StoreOps.Api.Newsletter.Services;

namespace StoreOps.Api.Newsletter.Controllers;

// Joining and leaving the newsletter. Public, and both answer 204 whatever the state, so neither
// reveals whether an address is on the list.
[ApiController]
[Route("api/newsletter")]
[AllowAnonymous]
public sealed class NewsletterController(NewsletterService newsletter) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.PublicForms)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Subscribe(SubscribeRequest request, CancellationToken ct)
    {
        await newsletter.SubscribeAsync(request.Email, ct);
        return NoContent();
    }

    // POST only: the web page's Unsubscribe button, and mail apps' one-click Unsubscribe (RFC 8058).
    // A GET would let link scanners unsubscribe people just by opening the email.
    [HttpPost("unsubscribe/{token}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Unsubscribe([StringLength(64)] string token, CancellationToken ct)
    {
        await newsletter.UnsubscribeAsync(token, ct);
        return NoContent();
    }
}
