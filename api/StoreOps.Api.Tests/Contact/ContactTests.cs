using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Contact;

public class ContactTests(ApiFixture api) : IClassFixture<ApiFixture>, IAsyncLifetime
{
    private const string StoreInbox = "help-desk@example.test";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await SetInboxAsync(StoreInbox);

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task A_message_goes_to_the_stores_inbox_ready_to_answer()
    {
        var customer = $"{Guid.NewGuid():N}@example.test";

        var response = await SendAsync(new
        {
            name = "Ada <Lovelace>",
            email = customer,
            subject = "Brush sizes",
            message = "Which brush suits gouache?",
        });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await using var db = api.CreateContext();
        var email = await db.EmailOutbox.SingleAsync(m => m.ReplyToAddress == customer, Ct);
        Assert.Equal(StoreInbox, email.ToAddress);
        Assert.Equal(EmailKind.SupportRequest, email.Kind);
        Assert.Equal("Contact form: Brush sizes", email.Subject);
        Assert.Contains("Which brush suits gouache?", email.HtmlBody);
        Assert.Contains("Ada &lt;Lovelace&gt;", email.HtmlBody);
    }

    [Fact]
    public async Task A_subject_stays_on_one_line()
    {
        var customer = $"{Guid.NewGuid():N}@example.test";

        await SendAsync(new { name = "Ada", email = customer, subject = "Hello\r\nBcc: someone@example.test", message = "Which brush suits gouache?" });

        await using var db = api.CreateContext();
        var email = await db.EmailOutbox.SingleAsync(m => m.ReplyToAddress == customer, Ct);
        Assert.Equal("Contact form: Hello Bcc: someone@example.test", email.Subject);
    }

    [Theory]
    [InlineData("email", "not-an-email")]
    [InlineData("message", "Hi")]
    [InlineData("name", "")]
    public async Task A_message_is_checked_before_it_is_sent(string field, string value)
    {
        var message = new Dictionary<string, string>
        {
            ["name"] = "Ada",
            ["email"] = "ada@example.test",
            ["subject"] = "Brush sizes",
            ["message"] = "Which brush suits gouache?",
        };
        message[field] = value;

        var response = await SendAsync(message);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task Without_a_store_inbox_the_form_is_closed()
    {
        await SetInboxAsync(null);

        var response = await SendAsync(new { name = "Ada", email = "ada@example.test", subject = "Hi", message = "Which brush suits gouache?" });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("CONTACT_NOT_CONFIGURED", (await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("code").GetString());
    }

    private Task<HttpResponseMessage> SendAsync(object message) =>
        api.Factory.CreateClient().PostAsJsonAsync("/api/contact", message, Ct);

    private async Task SetInboxAsync(string? inbox)
    {
        await using var db = api.CreateContext();
        await db.StoreSettings.ExecuteUpdateAsync(s => s.SetProperty(x => x.SupportEmail, inbox), Ct);
    }
}
