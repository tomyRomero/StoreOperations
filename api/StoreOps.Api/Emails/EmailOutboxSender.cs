using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MimeKit;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Emails;

// Sends the emails that are due, oldest first. A failure is retried later (1, 5, 15, 60, then 240
// minutes); after six attempts the email is marked Failed. The error is kept, never the address in logs.
public sealed class EmailOutboxSender(
    AppDbContext db, IOptions<EmailOptions> options, TimeProvider clock, ILogger<EmailOutboxSender> logger)
{
    public const int MaxAttempts = 6;
    private const int BatchSize = 20;

    // Returns how many were sent
    public async Task<int> SendDueAsync(CancellationToken ct)
    {
        var email = options.Value;
        if (!email.IsConfigured)
            return 0;

        var now = clock.GetUtcNow().UtcDateTime;
        var due = await db.EmailOutbox
            .Where(m => m.Status == EmailStatus.Pending && m.NextAttemptAtUtc <= now)
            .OrderBy(m => m.Id)
            .Take(BatchSize)
            .ToListAsync(ct);
        if (due.Count == 0)
            return 0;

        using var smtp = new SmtpClient();
        try
        {
            // IsConfigured above guarantees a host
            await smtp.ConnectAsync(email.Host!, email.Port, email.Security, ct);
            if (!string.IsNullOrEmpty(email.Username))
                await smtp.AuthenticateAsync(email.Username, email.Password ?? "", ct);
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            foreach (var message in due)
                RecordFailure(message, error);
            await db.SaveChangesAsync(ct);
            return 0;
        }

        var sent = 0;
        foreach (var message in due)
        {
            try
            {
                await smtp.SendAsync(ToMime(message, email), ct);
                message.Attempts++;
                message.Status = EmailStatus.Sent;
                message.SentAtUtc = clock.GetUtcNow().UtcDateTime;
                sent++;
            }
            catch (Exception error) when (error is not OperationCanceledException)
            {
                RecordFailure(message, error);
            }

            // Saved one by one, so an email that went out is never sent again after a crash
            await db.SaveChangesAsync(ct);
        }

        await smtp.DisconnectAsync(quit: true, ct);
        return sent;
    }

    private void RecordFailure(EmailOutboxMessage message, Exception error)
    {
        message.Attempts++;
        message.LastError = error.Message.Length <= 1000 ? error.Message : error.Message[..1000];
        if (message.Attempts >= MaxAttempts)
            message.Status = EmailStatus.Failed;
        else
            message.NextAttemptAtUtc = clock.GetUtcNow().UtcDateTime + RetryDelay(message.Attempts);

        logger.LogWarning(error, "Email {EmailId} ({Kind}) failed on attempt {Attempt}", message.Id, message.Kind, message.Attempts);
    }

    private static TimeSpan RetryDelay(int attempts) => attempts switch
    {
        1 => TimeSpan.FromMinutes(1),
        2 => TimeSpan.FromMinutes(5),
        3 => TimeSpan.FromMinutes(15),
        4 => TimeSpan.FromHours(1),
        _ => TimeSpan.FromHours(4),
    };

    private static MimeMessage ToMime(EmailOutboxMessage message, EmailOptions email)
    {
        var mime = new MimeMessage { Subject = message.Subject };
        mime.From.Add(new MailboxAddress(email.FromName, email.FromAddress));
        mime.To.Add(MailboxAddress.Parse(message.ToAddress));
        if (message.ReplyToAddress is not null)
            mime.ReplyTo.Add(MailboxAddress.Parse(message.ReplyToAddress));
        if (message.UnsubscribeUrl is not null)
        {
            // RFC 8058 one-click unsubscribe: mail apps show an Unsubscribe button that POSTs to the link
            mime.Headers.Add("List-Unsubscribe", $"<{message.UnsubscribeUrl}>");
            mime.Headers.Add("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
        }
        mime.Body = new BodyBuilder { HtmlBody = message.HtmlBody, TextBody = message.TextBody }.ToMessageBody();
        return mime;
    }
}
