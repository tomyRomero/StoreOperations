using System.Text.Json;
using StoreOps.Api.Domain;

namespace StoreOps.Api.ActivityFeed.Models;

public sealed record ActivityQuery(ActivityEntity? EntityType, int? EntityId, int Page, int PageSize);

// One event in the admin's activity feed. Actor is the admin's username, or null when a customer or
// the system did it. Details are the event's own facts as they were at the time, such as
// { "orderNumber": "7K3M9Q2A", "from": "pending", "to": "shipped" }.
public sealed record ActivityEntryResponse(
    int Id,
    DateTime OccurredAtUtc,
    ActivityAction Action,
    ActivityEntity? EntityType,
    int? EntityId,
    string? Actor,
    JsonElement? Details);
