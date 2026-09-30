namespace StoreOps.Api.Domain;

// Unsubscribing deletes the row, so no personal data is kept after someone leaves
public class NewsletterSubscriber
{
    public int Id { get; set; }

    // Trimmed and lower-cased before saving
    public required string Email { get; set; }

    // Random and unique: every newsletter email links to /unsubscribe/{token}
    public required string UnsubscribeToken { get; set; }

    public DateTime SubscribedAtUtc { get; set; }
}
