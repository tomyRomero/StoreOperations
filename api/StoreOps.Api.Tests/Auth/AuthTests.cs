using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Auth;

public class AuthTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private const string Password = "Paint-Brush-2026!";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Registering_creates_the_account_and_signs_in()
    {
        var client = api.Factory.CreateClient();
        var email = NewEmail();

        var response = await RegisterAsync(client, email);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var me = await client.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);
        Assert.Equal(email, me.GetProperty("email").GetString());
        Assert.False(me.GetProperty("isAdmin").GetBoolean());
    }

    [Fact]
    public async Task The_session_cookie_is_http_only_and_same_site_lax()
    {
        var response = await RegisterAsync(api.Factory.CreateClient(), NewEmail());

        var cookie = Assert.Single(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("palettehub_session=", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Auth_responses_are_never_cached()
    {
        var response = await RegisterAsync(api.Factory.CreateClient(), NewEmail());

        Assert.True(response.Headers.CacheControl?.NoStore);
    }

    [Fact]
    public async Task Registering_is_recorded_in_the_activity_log()
    {
        var client = api.Factory.CreateClient();
        await RegisterAsync(client, NewEmail());
        var me = await client.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);

        await using var db = api.CreateContext();
        Assert.True(await db.ActivityLog.AnyAsync(e =>
            e.Action == ActivityAction.UserRegistered && e.EntityId == me.GetProperty("id").GetInt32(), Ct));
    }

    [Fact]
    public async Task An_email_can_only_be_registered_once_whatever_its_case()
    {
        var email = NewEmail();
        await RegisterAsync(api.Factory.CreateClient(), email);

        var response = await RegisterAsync(api.Factory.CreateClient(), email.ToUpperInvariant());

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("ACCOUNT_EXISTS", await CodeOf(response));
    }

    [Theory]
    [InlineData("short1!A")]         // 8 characters
    [InlineData("no-uppercase-123")]
    [InlineData("No-Numbers-Here")]
    [InlineData("NoSymbols12345")]
    public async Task Weak_passwords_are_rejected_on_the_password_field(string password)
    {
        var response = await RegisterAsync(api.Factory.CreateClient(), NewEmail(), password: password);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await ErrorsOf(response)).TryGetProperty("password", out _));
    }

    [Theory]
    [InlineData("admin")]
    [InlineData("Support")]
    [InlineData("has space")]
    [InlineData("ab")]
    public async Task Reserved_or_malformed_usernames_are_rejected(string username)
    {
        var response = await RegisterAsync(api.Factory.CreateClient(), NewEmail(), username: username);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = await ErrorsOf(response);
        Assert.True(errors.TryGetProperty("username", out _), errors.ToString());
    }

    [Fact]
    public async Task Signing_in_with_the_right_password_works()
    {
        var email = await RegisterNewAccountAsync();
        var client = api.Factory.CreateClient();

        var response = await LoginAsync(client, email, Password);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me", Ct)).StatusCode);
    }

    [Fact]
    public async Task A_wrong_password_and_an_unknown_email_get_the_same_answer()
    {
        var email = await RegisterNewAccountAsync();

        var wrongPassword = await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");
        var unknownEmail = await LoginAsync(api.Factory.CreateClient(), NewEmail(), "Wrong-Password-1");

        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknownEmail.StatusCode);
        var wrongPasswordBody = await BodyOf(wrongPassword);
        var unknownEmailBody = await BodyOf(unknownEmail);
        Assert.Equal("INVALID_CREDENTIALS", unknownEmailBody.GetProperty("code").GetString());
        Assert.Equal(wrongPasswordBody.GetProperty("code").GetString(), unknownEmailBody.GetProperty("code").GetString());
        Assert.Equal(wrongPasswordBody.GetProperty("detail").GetString(), unknownEmailBody.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task Five_failures_lock_the_account_even_against_the_right_password()
    {
        var email = await RegisterNewAccountAsync();
        for (var i = 0; i < 4; i++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1")).StatusCode);

        var fifth = await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");
        var withRightPassword = await LoginAsync(api.Factory.CreateClient(), email, Password);

        Assert.Equal((HttpStatusCode)423, fifth.StatusCode);
        Assert.Equal((HttpStatusCode)423, withRightPassword.StatusCode);
        Assert.Equal("ACCOUNT_LOCKED", await CodeOf(withRightPassword));
        var retryAfter = withRightPassword.Headers.RetryAfter?.Delta;
        Assert.NotNull(retryAfter);
        Assert.InRange(retryAfter.Value.TotalMinutes, 14, 15);
    }

    [Fact]
    public async Task Unknown_emails_lock_the_same_way_so_lockout_reveals_nothing()
    {
        var email = NewEmail();
        HttpResponseMessage last = null!;
        for (var i = 0; i < 5; i++)
            last = await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");

        Assert.Equal((HttpStatusCode)423, last.StatusCode);
    }

    [Fact]
    public async Task A_successful_sign_in_resets_the_failure_count()
    {
        var email = await RegisterNewAccountAsync();
        for (var i = 0; i < 4; i++)
            await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");
        await LoginAsync(api.Factory.CreateClient(), email, Password);

        for (var i = 0; i < 4; i++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1")).StatusCode);
    }

    [Fact]
    public async Task A_disabled_account_is_only_revealed_to_someone_with_its_password()
    {
        var email = await RegisterNewAccountAsync();
        await using (var scope = api.Factory.Services.CreateAsyncScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var user = await users.FindByEmailAsync(email);
            await users.SetLockoutEndDateAsync(user!, DateTimeOffset.MaxValue);
        }

        var wrongPassword = await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");
        var rightPassword = await LoginAsync(api.Factory.CreateClient(), email, Password);

        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, rightPassword.StatusCode);
        Assert.Equal("ACCOUNT_DISABLED", await CodeOf(rightPassword));
    }

    [Fact]
    public async Task Signing_out_ends_the_session()
    {
        var client = api.Factory.CreateClient();
        await RegisterAsync(client, NewEmail());

        var response = await client.PostAsync("/api/auth/logout", null, Ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me", Ct)).StatusCode);
    }

    [Fact]
    public async Task Endpoints_require_a_signed_in_user_by_default()
    {
        var response = await api.Factory.CreateClient().GetAsync("/api/auth/me", Ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("NOT_SIGNED_IN", await CodeOf(response));
    }

    [Fact]
    public async Task Admins_are_identified_as_admins()
    {
        var email = await RegisterNewAccountAsync();
        await using (var scope = api.Factory.Services.CreateAsyncScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            await users.AddToRoleAsync((await users.FindByEmailAsync(email))!, Roles.Admin);
        }
        var client = api.Factory.CreateClient();
        await LoginAsync(client, email, Password);

        var me = await client.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);

        Assert.True(me.GetProperty("isAdmin").GetBoolean());
    }

    private static string NewEmail() => $"{Guid.NewGuid():N}@example.test";

    private async Task<string> RegisterNewAccountAsync()
    {
        var email = NewEmail();
        var response = await RegisterAsync(api.Factory.CreateClient(), email);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return email;
    }

    private static Task<HttpResponseMessage> RegisterAsync(
        HttpClient client, string email, string? username = null, string password = Password) =>
        client.PostAsJsonAsync("/api/auth/register",
            new { username = username ?? $"u-{Guid.NewGuid():N}"[..20], email, password }, Ct);

    private static Task<HttpResponseMessage> LoginAsync(HttpClient client, string email, string password) =>
        client.PostAsJsonAsync("/api/auth/login", new { email, password }, Ct);

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) =>
        response.Content.ReadFromJsonAsync<JsonElement>(Ct);

    private static async Task<string?> CodeOf(HttpResponseMessage response) =>
        (await BodyOf(response)).GetProperty("code").GetString();

    private static async Task<JsonElement> ErrorsOf(HttpResponseMessage response) =>
        (await BodyOf(response)).GetProperty("errors");
}
