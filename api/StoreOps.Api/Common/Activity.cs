using System.Text.Json;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Common;

public static class Activity
{
    private static readonly JsonSerializerOptions DetailsJson = new(JsonSerializerDefaults.Web);

    // An entry for the admin activity feed. The details are stored as they are now, so the feed
    // still reads correctly after the product or category changes again.
    public static ActivityLogEntry Entry(
        ActivityAction action, ActivityEntity entity, int entityId, int actorUserId, object details, TimeProvider clock) => new()
    {
        Action = action,
        EntityType = entity,
        EntityId = entityId,
        ActorUserId = actorUserId,
        DetailsJson = JsonSerializer.Serialize(details, DetailsJson),
        OccurredAtUtc = clock.GetUtcNow().UtcDateTime,
    };
}
