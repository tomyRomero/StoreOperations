using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.ActivityFeed.Models;
using StoreOps.Api.ActivityFeed.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Domain;

namespace StoreOps.Api.ActivityFeed.Controllers;

[Route("api/admin/activity")]
public sealed class AdminActivityController(ActivityFeedService activity) : AdminControllerBase
{
    // ?entityType=user&entityId=12 shows one account's history (or one product's, one category's...)
    [HttpGet]
    public async Task<Paged<ActivityEntryResponse>> List(
        [FromQuery] ActivityEntity? entityType,
        [FromQuery] int? entityId,
        [FromQuery, Range(1, 10_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken ct = default) =>
        await activity.ListAsync(new ActivityQuery(entityType, entityId, page, pageSize), ct);
}
