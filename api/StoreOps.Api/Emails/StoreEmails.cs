using System.Text;
using Microsoft.AspNetCore.Components;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails.Templates;
using StoreOps.Api.Orders.Services;

namespace StoreOps.Api.Emails;

// Adds emails to the outbox. They are saved by the caller's next SaveChanges, so an email is written
// in the same transaction as the change that caused it: never lost, never sent for a rolled-back change.
public sealed class StoreEmails(AppDbContext db, EmailRenderer renderer, IOptions<SiteOptions> site, TimeProvider clock)
{
    private string SiteUrl => site.Value.PublicUrl.TrimEnd('/');

    public async Task AddWelcomeAsync(string username, string email, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        var model = new WelcomeEmailModel(settings.StoreName, settings.SupportEmail, username, SiteUrl);
        await AddAsync<WelcomeEmail>(EmailKind.Welcome, email, $"Welcome to {settings.StoreName}!", model,
            $"Welcome to {settings.StoreName}, {username}!\n\nYour account is ready. Start browsing: {SiteUrl}\n");
    }

    // The customer's confirmation and a note for the store, or, for a refunded order, the refund email
    public async Task AddForPlacedOrderAsync(Order order, string customerEmail, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        var model = new OrderEmailModel(
            settings.StoreName,
            settings.SupportEmail,
            order.OrderNumber,
            $"{SiteUrl}/orders/{order.OrderNumber}",
            order.Lines.Select(l => new OrderEmailLine(l.ProductName, l.Quantity, l.UnitPriceCents * l.Quantity)).ToList(),
            order.ShipTo,
            order.SubtotalCents,
            order.ShippingCents,
            order.TaxCents,
            order.TotalCents,
            order.StatusHistory.LastOrDefault(s => s.Status == OrderStatus.Refunded)?.Note);

        if (order.Status == OrderStatus.Refunded)
        {
            await AddAsync<OrderRefundedEmail>(EmailKind.OrderRefunded, customerEmail,
                $"We refunded your {settings.StoreName} payment", model, OrderText("We refunded your payment in full.", model));
            return;
        }

        await AddAsync<OrderConfirmationEmail>(EmailKind.OrderConfirmation, customerEmail,
            $"Order confirmation from {settings.StoreName}", model, OrderText("Thanks for your order!", model));

        if (settings.SupportEmail is { } storeInbox)
        {
            var forStore = model with { OrderUrl = $"{SiteUrl}/admin/orders/{order.OrderNumber}" };
            await AddAsync<AdminNewOrderEmail>(EmailKind.AdminNewOrder, storeInbox,
                $"New order {order.OrderNumber}", forStore, OrderText("A new order came in.", forStore));
        }
    }

    // Only when the admin chose to email the customer about a status change
    public async Task AddStatusUpdateAsync(Order order, string customerEmail, string? note, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        var model = new OrderStatusEmailModel(
            settings.StoreName,
            settings.SupportEmail,
            order.OrderNumber,
            $"{SiteUrl}/orders/{order.OrderNumber}",
            order.Status,
            order.ShipTo.RecipientName,
            order.Carrier is { } carrier ? CarrierNames.Of(carrier) : null,
            order.TrackingNumber,
            Tracking.UrlFor(order.Carrier, order.TrackingNumber),
            order.EstimatedDeliveryDate,
            note,
            // Cancelling or refunding always refunds the payment in full
            order.Status is OrderStatus.Cancelled or OrderStatus.Refunded ? order.TotalCents : null);

        var text = new StringBuilder()
            .AppendLine($"{model.Headline}: order {order.OrderNumber}.");
        if (note is not null)
            text.AppendLine(note);
        if (model.RefundedCents is { } refunded)
            text.AppendLine($"We refunded {Money.Format(refunded)} to your card. It usually shows within 5 to 10 business days.");
        if (model.TrackingNumber is not null)
            text.AppendLine($"{model.CarrierName ?? "Tracking"} number: {model.TrackingNumber} {model.TrackingUrl}");
        text.AppendLine().AppendLine($"See your order: {model.OrderUrl}");

        await AddAsync<OrderStatusUpdateEmail>(EmailKind.OrderStatusUpdate, customerEmail,
            $"{model.Headline} ({order.OrderNumber})", model, text.ToString());
    }

    // Tells a new subscriber they're on the list, with a link to leave in case someone else typed their address
    public async Task AddNewsletterWelcomeAsync(string email, string unsubscribeToken, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        var model = new NewsletterWelcomeEmailModel(settings.StoreName, settings.SupportEmail, SiteUrl, UnsubscribePageUrl(unsubscribeToken));
        await AddAsync<NewsletterWelcomeEmail>(EmailKind.NewsletterWelcome, email, $"You're subscribed to {settings.StoreName} news", model,
            $"Thanks for signing up for {settings.StoreName} news.\n\nDidn't sign up? Unsubscribe: {model.UnsubscribeUrl}\n",
            unsubscribeUrl: OneClickUnsubscribeUrl(unsubscribeToken));
    }

    // One email per subscriber, each with its own unsubscribe link. Returns how many were queued.
    public async Task<int> AddNewsletterAsync(
        string subject, string body, IReadOnlyList<(string Email, string UnsubscribeToken)> recipients, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        var paragraphs = body.ReplaceLineEndings("\n")
            .Split("\n\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var (email, token) in recipients)
        {
            var model = new NewsletterEmailModel(
                settings.StoreName, settings.SupportEmail, subject, paragraphs, SiteUrl, UnsubscribePageUrl(token));
            await AddAsync<NewsletterEmail>(EmailKind.Newsletter, email, subject, model,
                $"{subject}\n\n{string.Join("\n\n", paragraphs)}\n\nVisit the store: {SiteUrl}\nUnsubscribe: {model.UnsubscribeUrl}\n",
                unsubscribeUrl: OneClickUnsubscribeUrl(token));
        }
        return recipients.Count;
    }

    // A contact form message for the store's inbox, with the customer as the reply address.
    // Returns false when the store has no inbox set in Store settings.
    public async Task<bool> AddSupportRequestAsync(string name, string email, string subject, string message, CancellationToken ct)
    {
        var settings = await SettingsAsync(ct);
        if (settings.SupportEmail is not { } storeInbox)
            return false;

        var model = new SupportRequestEmailModel(settings.StoreName, name, email, subject, message);
        await AddAsync<SupportRequestEmail>(EmailKind.SupportRequest, storeInbox, $"Contact form: {subject}", model,
            $"From {name} <{email}>. Reply to this email to answer them.\n\n{subject}\n\n{message}\n",
            replyTo: email);
        return true;
    }

    // The page that asks "Unsubscribe?" before doing it, so a link scanner opening the link changes nothing
    private string UnsubscribePageUrl(string token) => $"{SiteUrl}/unsubscribe/{token}";

    // Where a mail app's Unsubscribe button POSTs (through the web app's /api rewrite)
    private string OneClickUnsubscribeUrl(string token) => $"{SiteUrl}/api/newsletter/unsubscribe/{token}";

    private async Task AddAsync<TTemplate>(
        EmailKind kind, string to, string subject, object model, string text, string? replyTo = null, string? unsubscribeUrl = null)
        where TTemplate : IComponent
    {
        db.EmailOutbox.Add(new EmailOutboxMessage
        {
            Kind = kind,
            ToAddress = to,
            Subject = subject,
            HtmlBody = await renderer.RenderAsync<TTemplate>(new() { ["Model"] = model }),
            TextBody = text,
            ReplyToAddress = replyTo,
            UnsubscribeUrl = unsubscribeUrl,
            NextAttemptAtUtc = clock.GetUtcNow().UtcDateTime,
        });
    }

    private Task<StoreSettings> SettingsAsync(CancellationToken ct) => db.StoreSettings.AsNoTracking().SingleAsync(ct);

    // The plain-text part, for mail apps that don't show HTML
    private static string OrderText(string opening, OrderEmailModel model)
    {
        var text = new StringBuilder()
            .AppendLine(opening)
            .AppendLine()
            .AppendLine($"Order {model.OrderNumber}");
        if (model.Note is not null)
            text.AppendLine(model.Note);
        text.AppendLine();
        foreach (var line in model.Lines)
            text.AppendLine($"{line.Quantity} x {line.Name}  {Money.Format(line.LineTotalCents)}");
        return text
            .AppendLine()
            .AppendLine($"Subtotal {Money.Format(model.SubtotalCents)}")
            .AppendLine($"Shipping {Money.Format(model.ShippingCents)}")
            .AppendLine($"Tax      {Money.Format(model.TaxCents)}")
            .AppendLine($"Total    {Money.Format(model.TotalCents)}")
            .AppendLine()
            .AppendLine($"Ship to: {model.ShipTo.RecipientName}, {model.ShipTo.Line1}, {model.ShipTo.City}")
            .AppendLine()
            .AppendLine($"View your order: {model.OrderUrl}")
            .ToString();
    }
}
