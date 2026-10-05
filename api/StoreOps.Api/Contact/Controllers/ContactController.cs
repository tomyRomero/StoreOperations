using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoreOps.Api.Common;
using StoreOps.Api.Contact.Models;
using StoreOps.Api.Contact.Services;

namespace StoreOps.Api.Contact.Controllers;

[ApiController]
[Route("api/contact")]
[AllowAnonymous]
public sealed class ContactController(ContactService contact) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.PublicForms)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Send(ContactRequest request, CancellationToken ct) =>
        await contact.SendAsync(request, ct) is { } error ? this.ErrorResponse(error) : NoContent();
}
