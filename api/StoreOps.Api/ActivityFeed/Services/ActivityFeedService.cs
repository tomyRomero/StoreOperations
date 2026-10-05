using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.ActivityFeed.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;

namespace StoreOps.Api.ActivityFeed.Services;

// The admin's activity feed, newest first: everything admins did, plus sign-ups and new orders
public sealed class ActivityFeedService(AppDbContext db)
{
    public async Task<Paged<ActivityEntryResponse>> ListAsync(ActivityQuery query, CancellationToken ct)
    {
        var entries = db.ActivityLog.AsQueryable();
        if (query.EntityType is { } entityType)
            entries = entries.Where(e => e.EntityType == entityType);
        if (query.EntityId is { } entityId)
            entries = entries.Where(e => e.EntityId == entityId);

        var totalCount = await entries.CountAsync(ct);
        var rows = await entries
            .OrderByDescending(e => e.OccurredAtUtc).ThenByDescending(e => e.Id)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(e => new
            {
                e.Id,
                e.OccurredAtUtc,
                e.Action,
                e.EntityType,
                e.EntityId,
                Actor = e.Actor == null ? null : e.Actor.UserName,
                e.DetailsJson,
            })
            .ToListAsync(ct);

        var items = rows
            .Select(e => new ActivityEntryResponse(
                e.Id,
                e.OccurredAtUtc,
                e.Action,
                e.EntityType,
                e.EntityId,
                e.Actor,
                // Stored as JSON objects (a CHECK constraint makes sure), returned as they are
                e.DetailsJson is null ? null : JsonSerializer.Deserialize<JsonElement>(e.DetailsJson)))
            .ToList();

        return new Paged<ActivityEntryResponse>(items, query.Page, query.PageSize, totalCount);
    }
}
