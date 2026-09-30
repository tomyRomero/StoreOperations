using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Emails;

public class EmailTests(ApiFixture api, MailpitFixture mailpit) : IClassFixture<ApiFixture>, IClassFixture<MailpitFixture>, IAsyncLifetime
{
    private const string StoreInbox = "orders-desk@example.test";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // The store's settings name an inbox for new-order notes
    public async ValueTask InitializeAsync()
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.SupportEmail, StoreInbox), Ct);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task Signing_up_queues_a_welcome_email()
    {
        var email = $"{Guid.NewGuid():N}@example.test";

        await api.Factory.CreateClient().PostAsJsonAsync("/api/auth/register",
            new { username = $"u-{Guid.NewGuid():N}"[..20], email, password = ApiFixture.Password }, Ct);

        var queued = Assert.Single(await QueuedToAsync(email));
        Assert.Equal(EmailKind.Welcome, queued.Kind);
        Assert.Equal("Welcome to Palettehub!", queued.Subject);
    }

    [Fact]
    public async Task A_new_order_queues_a_confirmation_and_a_note_for_the_store()
    {
        var sale = await api.PaidCheckoutAsync(priceCents: 1850, productName: $"Chalk Paint {Guid.NewGuid():N}"[..20]);

        await api.WebhookArrivesAsync(sale);

        var toCustomer = (await QueuedToAsync(sale.Email)).Single(m => m.Kind == EmailKind.OrderConfirmation);
        var orderNumber = await OrderNumberOfAsync(sale);
        Assert.Equal("Order confirmation from Palettehub", toCustomer.Subject);
        Assert.Contains(orderNumber, toCustomer.HtmlBody);
        Assert.Contains("$18.50", toCustomer.HtmlBody);
        Assert.Contains($"http://localhost:3200/orders/{orderNumber}", toCustomer.HtmlBody);
        Assert.Contains(orderNumber, toCustomer.TextBody);

        var toStore = (await QueuedToAsync(StoreInbox)).Single(m => m.Subject == $"New order {orderNumber}");
        Assert.Equal(EmailKind.AdminNewOrder, toStore.Kind);
        Assert.Contains($"/admin/orders/{orderNumber}", toStore.HtmlBody);
    }

    [Fact]
    public async Task A_refunded_order_sends_the_refund_email_instead()
    {
        var sale = await api.PaidCheckoutAsync(quantity: 2, stock: 5);
        await using (var db = api.CreateContext())
            await db.Products.Where(p => p.Id == sale.ProductId).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, 0), Ct);

        await api.WebhookArrivesAsync(sale);

        // Besides the welcome email from signing up, only the refund email: no confirmation
        var queued = Assert.Single(await QueuedToAsync(sale.Email), m => m.Kind != EmailKind.Welcome);
        Assert.Equal(EmailKind.OrderRefunded, queued.Kind);
        Assert.Contains("sold out", queued.HtmlBody);
    }

    [Fact]
    public async Task Whatever_a_product_is_called_it_cannot_change_the_email_markup()
    {
        var sale = await api.PaidCheckoutAsync(productName: $"<b>Bold</b> & {Guid.NewGuid():N}"[..24]);

        await api.WebhookArrivesAsync(sale);

        var html = (await QueuedToAsync(sale.Email)).Single(m => m.Kind == EmailKind.OrderConfirmation).HtmlBody;
        Assert.Contains("&lt;b&gt;Bold&lt;/b&gt; &amp;", html);
        Assert.DoesNotContain("<b>Bold</b>", html);
    }

    [Fact]
    public async Task Queued_emails_are_sent_over_smtp_and_marked_sent()
    {
        var sale = await api.PaidCheckoutAsync();
        await api.WebhookArrivesAsync(sale);

        await using var withMailpit = WithSmtp(mailpit.Host, mailpit.Port);
        await SendDueAsync(withMailpit);

        var delivered = await mailpit.MessagesToAsync(sale.Email);
        Assert.Contains(delivered, m => m.Subject == "Order confirmation from Palettehub" && m.Html.Contains("Thanks for your order!"));
        Assert.All(await QueuedToAsync(sale.Email), m => Assert.Equal(EmailStatus.Sent, m.Status));
    }

    [Fact]
    public async Task When_the_mail_server_is_down_an_email_waits_and_is_retried_then_given_up()
    {
        var sale = await api.PaidCheckoutAsync();
        await api.WebhookArrivesAsync(sale);
        await using var withNoServer = WithSmtp("127.0.0.1", 1);

        await SendDueAsync(withNoServer);

        var waiting = (await QueuedToAsync(sale.Email)).Single(m => m.Kind == EmailKind.OrderConfirmation);
        Assert.Equal(EmailStatus.Pending, waiting.Status);
        Assert.Equal(1, waiting.Attempts);
        Assert.NotNull(waiting.LastError);
        Assert.True(waiting.NextAttemptAtUtc > DateTime.UtcNow);

        // Five failures later, the sixth one gives up
        await using (var db = api.CreateContext())
            await db.EmailOutbox.Where(m => m.Id == waiting.Id).ExecuteUpdateAsync(s => s
                .SetProperty(m => m.Attempts, (byte)(EmailOutboxSender.MaxAttempts - 1))
                .SetProperty(m => m.NextAttemptAtUtc, DateTime.UtcNow.AddMinutes(-1)), Ct);
        await SendDueAsync(withNoServer);

        Assert.Equal(EmailStatus.Failed, (await QueuedToAsync(sale.Email)).Single(m => m.Id == waiting.Id).Status);
    }

    private WebApplicationFactory<Program> WithSmtp(string host, int port) =>
        api.Factory.WithWebHostBuilder(builder => builder
            .UseSetting("Email:Host", host)
            .UseSetting("Email:Port", port.ToString(System.Globalization.CultureInfo.InvariantCulture))
            .UseSetting("Email:Security", "None")
            .UseSetting("Email:FromAddress", "orders@palettehub.test"));

    // Batch after batch until nothing more goes out, as the background worker would
    private static async Task SendDueAsync(WebApplicationFactory<Program> factory)
    {
        int sent;
        do
        {
            await using var scope = factory.Services.CreateAsyncScope();
            sent = await scope.ServiceProvider.GetRequiredService<EmailOutboxSender>().SendDueAsync(Ct);
        }
        while (sent > 0);
    }

    private async Task<List<EmailOutboxMessage>> QueuedToAsync(string address)
    {
        await using var db = api.CreateContext();
        return await db.EmailOutbox.Where(m => m.ToAddress == address).OrderBy(m => m.Id).ToListAsync(Ct);
    }

    private async Task<string> OrderNumberOfAsync(Sale sale)
    {
        await using var db = api.CreateContext();
        return await db.Orders.Where(o => o.StripePaymentIntentId == sale.Intent.Id).Select(o => o.OrderNumber).SingleAsync(Ct);
    }
}
