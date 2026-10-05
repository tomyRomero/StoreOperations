using System.Text.Json;
using System.Text.Json.Serialization;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Common;

public static class Activity
{
    // Enums as the API writes them ("shipped"), so the feed can show them as they are
    private static readonly JsonSerializerOptions DetailsJson = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower) },
    };

    // An entry for the admin activity feed. The details are stored as they are now, so the feed
    // still reads correctly after the product or category changes again. EntityId is null for an
    // action on many at once, such as removing subscribers.
    public static ActivityLogEntry Entry(
        ActivityAction action, ActivityEntity entity, int? entityId, int actorUserId, object details, TimeProvider clock)
    {
        return new ActivityLogEntry
        {
            Action = action,
            EntityType = entity,
            EntityId = entityId,
            ActorUserId = actorUserId,
            DetailsJson = JsonSerializer.Serialize(details, DetailsJson),
            OccurredAtUtc = clock.GetUtcNow().UtcDateTime,
        };
    }
}
