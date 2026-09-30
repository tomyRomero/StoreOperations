using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Newsletter.Models;

public sealed record SubscribeRequest
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; init; } = "";
}

public sealed record SubscriberResponse(int Id, string Email, DateTime SubscribedAtUtc);

public sealed record RemoveSubscribersRequest
{
    [Required, MinLength(1), MaxLength(500)]
    public int[] Ids { get; init; } = [];
}

public sealed record RemovedSubscribersResponse(int Removed);

// Plain text. A blank line starts a new paragraph.
public sealed record NewsletterRequest
{
    [Required, StringLength(150)]
    public string Subject { get; init; } = "";

    [Required, StringLength(10_000, MinimumLength = 20)]
    public string Body { get; init; } = "";
}

public sealed record NewsletterQueuedResponse(int Recipients);
