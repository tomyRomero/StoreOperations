namespace StoreOps.Api.Domain;

// An append-only event for the admin activity feed. Rows are never updated or deleted.
public class ActivityLogEntry
{
    public int Id { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public ActivityAction Action { get; set; }

    // The admin who did it. Null for customer and system events.
    public int? ActorUserId { get; set; }
    public ApplicationUser? Actor { get; set; }

    // What it was about. No foreign key on purpose: the log outlives the rows it describes.
    public ActivityEntity? EntityType { get; set; }
    public int? EntityId { get; set; }

    // Event-specific details as a JSON object, shown as they were at the time
    public string? DetailsJson { get; set; }
}

// Stored by name. No CHECK constraint, so old rows stay valid if an action is retired.
public enum ActivityAction
{
    UserRegistered,
    NewsletterSubscribed,
    NewsletterUnsubscribed,
    SubscribersRemoved,
    NewsletterSent,
    OrderCreated,
    OrderStatusChanged,
    ProductCreated,
    ProductUpdated,
    ProductArchived,
    ProductRestored,
    DealStarted,
    DealEnded,
    CategoryCreated,
    CategoryUpdated,
    CategoryDeleted,
    SettingsChanged,
}

public enum ActivityEntity
{
    User,
    Order,
    Product,
    Category,
    StoreSettings,
    NewsletterSubscriber,
}
