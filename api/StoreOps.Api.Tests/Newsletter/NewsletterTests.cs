using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Newsletter;

public class NewsletterTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Subscribing_twice_keeps_one_address_and_welcomes_it_once()
    {
        var email = NewEmail();

        var first = await SubscribeAsync(email.ToUpperInvariant());
        var second = await SubscribeAsync($" {email} ");

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
        await using var db = api.CreateContext();
        var subscriber = await db.NewsletterSubscribers.SingleAsync(s => s.Email == email, Ct);
        Assert.Equal(email, subscriber.Email);
        var welcome = Assert.Single(await db.EmailOutbox.Where(m => m.ToAddress == email).ToListAsync(Ct));
        Assert.Equal(EmailKind.NewsletterWelcome, welcome.Kind);
        Assert.Contains($"/unsubscribe/{subscriber.UnsubscribeToken}", welcome.HtmlBody);
        Assert.Equal($"http://localhost:3200/api/newsletter/unsubscribe/{subscriber.UnsubscribeToken}", welcome.UnsubscribeUrl);
    }

    [Fact]
    public async Task Unsubscribing_deletes_the_address_and_logs_no_address()
    {
        var email = NewEmail();
        await SubscribeAsync(email);
        var (id, token) = await SubscriberAsync(email);
        var visitor = api.Factory.CreateClient();

        var first = await visitor.PostAsync($"/api/newsletter/unsubscribe/{token}", null, Ct);
        var again = await visitor.PostAsync($"/api/newsletter/unsubscribe/{token}", null, Ct);

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, again.StatusCode);
        await using var db = api.CreateContext();
        Assert.False(await db.NewsletterSubscribers.AnyAsync(s => s.Email == email, Ct));
        var entry = await db.ActivityLog.SingleAsync(e => e.Action == ActivityAction.NewsletterUnsubscribed && e.EntityId == id, Ct);
        Assert.Null(entry.DetailsJson);
    }

    [Fact]
    public async Task Opening_the_unsubscribe_link_alone_changes_nothing()
    {
        var email = NewEmail();
        await SubscribeAsync(email);
        var (_, token) = await SubscriberAsync(email);

        var opened = await api.Factory.CreateClient().GetAsync($"/api/newsletter/unsubscribe/{token}", Ct);
        var unknown = await api.Factory.CreateClient().PostAsync("/api/newsletter/unsubscribe/not-a-real-token", null, Ct);

        Assert.False(opened.IsSuccessStatusCode);
        Assert.Equal(HttpStatusCode.NoContent, unknown.StatusCode);
        await using var db = api.CreateContext();
        Assert.True(await db.NewsletterSubscribers.AnyAsync(s => s.Email == email, Ct));
    }

    [Fact]
    public async Task Admins_find_subscribers_and_remove_them()
    {
        var admin = await api.CreateAdminClientAsync();
        var leaving = NewEmail();
        var staying = NewEmail();
        await SubscribeAsync(leaving);
        await SubscribeAsync(staying);
        var (id, _) = await SubscriberAsync(leaving);

        var found = Assert.Single(await ListAsync(admin, $"search={Uri.EscapeDataString(leaving)}"));
        var removed = await admin.PostAsJsonAsync("/api/admin/newsletter/subscribers/remove", new { ids = new[] { id, 999_999 } }, Ct);

        Assert.Equal(id, found.GetProperty("id").GetInt32());
        Assert.Equal(1, (await BodyOf(removed)).GetProperty("removed").GetInt32());
        Assert.Empty(await ListAsync(admin, $"search={Uri.EscapeDataString(leaving)}"));
        Assert.Single(await ListAsync(admin, $"search={Uri.EscapeDataString(staying)}"));
    }

    [Fact]
    public async Task Sending_queues_one_email_per_subscriber_each_with_its_own_link()
    {
        var admin = await api.CreateAdminClientAsync();
        var (ada, grace) = (NewEmail(), NewEmail());
        await SubscribeAsync(ada);
        await SubscribeAsync(grace);
        await using var db = api.CreateContext();
        var everyone = await db.NewsletterSubscribers.CountAsync(Ct);
        var subject = $"Autumn palette {Guid.NewGuid():N}";

        var response = await admin.PostAsJsonAsync("/api/admin/newsletter/send", new
        {
            subject,
            body = "New earth pigments are in.\r\n\r\nUmber, ochre and sienna, while they last.",
        }, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(everyone, (await BodyOf(response)).GetProperty("recipients").GetInt32());
        var (_, adaToken) = await SubscriberAsync(ada);
        var (_, graceToken) = await SubscriberAsync(grace);
        var toAda = await db.EmailOutbox.SingleAsync(m => m.ToAddress == ada && m.Kind == EmailKind.Newsletter, Ct);
        Assert.Equal(subject, toAda.Subject);
        Assert.Contains(">New earth pigments are in.</p>", toAda.HtmlBody);
        Assert.Contains(">Umber, ochre and sienna, while they last.</p>", toAda.HtmlBody);
        Assert.Contains(adaToken, toAda.HtmlBody);
        Assert.DoesNotContain(graceToken, toAda.HtmlBody);
        Assert.True(await db.ActivityLog.AnyAsync(e => e.Action == ActivityAction.NewsletterSent && e.DetailsJson!.Contains(subject), Ct));
    }

    [Fact]
    public async Task A_test_send_goes_only_to_the_admin()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminEmail = (await admin.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct)).GetProperty("email").GetString();

        var response = await admin.PostAsJsonAsync("/api/admin/newsletter/send-test",
            new { subject = "Autumn palette", body = "New earth pigments are in, while they last." }, Ct);

        Assert.Equal(1, (await BodyOf(response)).GetProperty("recipients").GetInt32());
        await using var db = api.CreateContext();
        var test = await db.EmailOutbox.SingleAsync(m => m.ToAddress == adminEmail && m.Kind == EmailKind.Newsletter, Ct);
        Assert.Equal("[Test] Autumn palette", test.Subject);
    }

    [Fact]
    public async Task There_is_nothing_to_send_without_subscribers()
    {
        var admin = await api.CreateAdminClientAsync();
        await using (var db = api.CreateContext())
            await db.NewsletterSubscribers.ExecuteDeleteAsync(Ct);

        var response = await admin.PostAsJsonAsync("/api/admin/newsletter/send",
            new { subject = "Autumn palette", body = "New earth pigments are in, while they last." }, Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("NO_SUBSCRIBERS", (await BodyOf(response)).GetProperty("code").GetString());
    }

    private static string NewEmail() => $"{Guid.NewGuid():N}@example.test";

    private Task<HttpResponseMessage> SubscribeAsync(string email) =>
        api.Factory.CreateClient().PostAsJsonAsync("/api/newsletter", new { email }, Ct);

    private async Task<(int Id, string Token)> SubscriberAsync(string email)
    {
        await using var db = api.CreateContext();
        var subscriber = await db.NewsletterSubscribers.SingleAsync(s => s.Email == email, Ct);
        return (subscriber.Id, subscriber.UnsubscribeToken);
    }

    private static async Task<List<JsonElement>> ListAsync(HttpClient admin, string query) =>
        (await admin.GetFromJsonAsync<JsonElement>($"/api/admin/newsletter/subscribers?{query}", Ct)).GetProperty("items").EnumerateArray().ToList();

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
