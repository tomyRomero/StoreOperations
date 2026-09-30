using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;
using StoreOps.Api.Newsletter.Models;
using StoreOps.Api.Newsletter.Services;

namespace StoreOps.Api.Newsletter.Controllers;

[Route("api/admin/newsletter")]
public sealed class AdminNewsletterController(NewsletterService newsletter) : AdminControllerBase
{
    [HttpGet("subscribers")]
    public async Task<Paged<SubscriberResponse>> Subscribers(
        [FromQuery, StringLength(100)] string? search,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken ct = default) =>
        await newsletter.ListAsync(search, page, pageSize, ct);

    [HttpPost("subscribers/remove")]
    public async Task<RemovedSubscribersResponse> Remove(RemoveSubscribersRequest request, CancellationToken ct) =>
        await newsletter.RemoveAsync(request.Ids, AdminId, ct);

    [HttpPost("send")]
    [ProducesResponseType<NewsletterQueuedResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Send(NewsletterRequest request, CancellationToken ct)
    {
        var (queued, error) = await newsletter.SendAsync(request, AdminId, ct);
        return error is not null ? this.ErrorResponse(error) : Ok(queued);
    }

    // Only to the signed-in admin, to check how it looks before sending it to everyone
    [HttpPost("send-test")]
    public async Task<NewsletterQueuedResponse> SendTest(NewsletterRequest request, CancellationToken ct) =>
        await newsletter.SendTestAsync(request, AdminId, ct);
}
