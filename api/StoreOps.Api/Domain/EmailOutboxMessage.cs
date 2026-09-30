namespace StoreOps.Api.Domain;

// An email waiting to be sent. Written in the same transaction as the change that causes it,
// then sent (and retried) by a background worker, so an email is never lost when SMTP is down
// and never sent for a change that rolled back.
public class EmailOutboxMessage : ICreatedAt
{
    public long Id { get; set; }
    public EmailKind Kind { get; set; }
    public required string ToAddress { get; set; }
    public required string Subject { get; set; }
    public required string HtmlBody { get; set; }
    public required string TextBody { get; set; }

    // Where a reply goes, when not to the store's own address (a contact form message: the customer)
    public string? ReplyToAddress { get; set; }
    // A newsletter's one-click unsubscribe link, sent as the List-Unsubscribe header mail apps show
    public string? UnsubscribeUrl { get; set; }

    public EmailStatus Status { get; set; } = EmailStatus.Pending;
    public byte Attempts { get; set; }
    public DateTime NextAttemptAtUtc { get; set; }
    // The SMTP error, never the message body
    public string? LastError { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? SentAtUtc { get; set; }
}

public enum EmailKind
{
    Welcome,
    OrderConfirmation,
    AdminNewOrder,
    OrderStatusUpdate,
    OrderRefunded,
    SupportRequest,
    Newsletter,
    NewsletterWelcome,
}

public enum EmailStatus
{
    Pending,
    Sent,
    Failed,
}
