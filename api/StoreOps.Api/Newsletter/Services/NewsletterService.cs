using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails;
using StoreOps.Api.Newsletter.Models;

namespace StoreOps.Api.Newsletter.Services;

public static class NewsletterErrors
{
    public static readonly ApiError NoSubscribers = new(StatusCodes.Status409Conflict, "NO_SUBSCRIBERS",
        "No one has subscribed yet, so there's no one to send it to.");
}

// The newsletter list and sending to it. Leaving deletes the subscriber's row, so no address is kept
// after someone unsubscribes, and the activity log never records addresses.
public sealed class NewsletterService(AppDbContext db, StoreEmails emails, TimeProvider clock)
{
    // Always the same answer, so the form never reveals who is subscribed. A new subscriber is
    // emailed to say so, with a link to leave in case someone else typed their address.
    public async Task SubscribeAsync(string email, CancellationToken ct)
    {
        var address = email.Trim().ToLowerInvariant();
        if (await db.NewsletterSubscribers.AnyAsync(s => s.Email == address, ct))
            return;

        try
        {
            await db.InTransactionAsync(async () =>
            {
                var subscriber = new NewsletterSubscriber
                {
                    Email = address,
                    UnsubscribeToken = RandomNumberGenerator.GetHexString(48, lowercase: true),
                    SubscribedAtUtc = clock.GetUtcNow().UtcDateTime,
                };
                db.NewsletterSubscribers.Add(subscriber);
                await db.SaveChangesAsync(ct);

                db.ActivityLog.Add(Entry(ActivityAction.NewsletterSubscribed, subscriber.Id));
                await emails.AddNewsletterWelcomeAsync(subscriber.Email, subscriber.UnsubscribeToken, ct);
                await db.SaveChangesAsync(ct);
                return subscriber.Id;
            }, ct);
        }
        catch (DbUpdateException error) when (error.IsUniqueViolation())
        {
            // The same address signed up a moment ago in another request
        }
    }

    // Unknown or already-used tokens are fine: the answer is the same, and nothing is revealed
    public async Task UnsubscribeAsync(string token, CancellationToken ct)
    {
        var id = await db.NewsletterSubscribers
            .Where(s => s.UnsubscribeToken == token)
            .Select(s => (int?)s.Id)
            .SingleOrDefaultAsync(ct);
        if (id is null)
            return;

        await db.InTransactionAsync(async () =>
        {
            // Two clicks at once delete it once, and log it once
            if (await db.NewsletterSubscribers.Where(s => s.Id == id).ExecuteDeleteAsync(ct) == 1)
            {
                db.ActivityLog.Add(Entry(ActivityAction.NewsletterUnsubscribed, id.Value));
                await db.SaveChangesAsync(ct);
            }
            return id;
        }, ct);
    }

    // Newest first. Search matches part of the address.
    public async Task<Paged<SubscriberResponse>> ListAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        var subscribers = db.NewsletterSubscribers.AsQueryable();
        if (search?.Trim() is { Length: > 0 } text)
            subscribers = subscribers.Where(s => s.Email.Contains(text));

        var totalCount = await subscribers.CountAsync(ct);
        var items = await subscribers
            .OrderByDescending(s => s.SubscribedAtUtc).ThenByDescending(s => s.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SubscriberResponse(s.Id, s.Email, s.SubscribedAtUtc))
            .ToListAsync(ct);

        return new Paged<SubscriberResponse>(items, page, pageSize, totalCount);
    }

    public async Task<RemovedSubscribersResponse> RemoveAsync(IReadOnlyCollection<int> ids, int adminId, CancellationToken ct)
    {
        var removed = await db.InTransactionAsync(async () =>
        {
            var count = await db.NewsletterSubscribers.Where(s => ids.Contains(s.Id)).ExecuteDeleteAsync(ct);
            if (count > 0)
            {
                db.ActivityLog.Add(Activity.Entry(
                    ActivityAction.SubscribersRemoved, ActivityEntity.NewsletterSubscriber, null, adminId, new { count }, clock));
                await db.SaveChangesAsync(ct);
            }
            return count;
        }, ct);

        return new RemovedSubscribersResponse(removed);
    }

    // Queues one email per subscriber in one transaction; the outbox worker sends them in batches
    public async Task<(NewsletterQueuedResponse? Queued, ApiError? Error)> SendAsync(
        NewsletterRequest request, int adminId, CancellationToken ct)
    {
        var recipients = (await db.NewsletterSubscribers
                .OrderBy(s => s.Id)
                .Select(s => new { s.Email, s.UnsubscribeToken })
                .ToListAsync(ct))
            .Select(s => (s.Email, s.UnsubscribeToken))
            .ToList();
        if (recipients.Count == 0)
            return (null, NewsletterErrors.NoSubscribers);

        var subject = SingleLine(request.Subject);
        var queued = await emails.AddNewsletterAsync(subject, request.Body, recipients, ct);
        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.NewsletterSent, ActivityEntity.NewsletterSubscriber, null, adminId, new { subject, recipients = queued }, clock));
        await db.SaveChangesAsync(ct);

        return (new NewsletterQueuedResponse(queued), null);
    }

    // The same email, only to the admin, marked as a test. Its unsubscribe link goes nowhere.
    public async Task<NewsletterQueuedResponse> SendTestAsync(NewsletterRequest request, int adminId, CancellationToken ct)
    {
        var adminEmail = await db.Users.Where(u => u.Id == adminId).Select(u => u.Email!).SingleAsync(ct);
        var queued = await emails.AddNewsletterAsync(
            $"[Test] {SingleLine(request.Subject)}", request.Body, [(adminEmail, "test")], ct);
        await db.SaveChangesAsync(ct);
        return new NewsletterQueuedResponse(queued);
    }

    // A subject is one line: no one can add mail headers through it
    private static string SingleLine(string text) => text.ReplaceLineEndings(" ").Trim();

    private ActivityLogEntry Entry(ActivityAction action, int subscriberId) => new()
    {
        Action = action,
        EntityType = ActivityEntity.NewsletterSubscriber,
        EntityId = subscriberId,
        OccurredAtUtc = clock.GetUtcNow().UtcDateTime,
    };
}
