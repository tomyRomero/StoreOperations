using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
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

        var cookie = Assert.Single(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("storeops_session=", StringComparison.Ordinal));
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
    public async Task Changing_the_password_keeps_this_session_and_signs_out_the_others()
    {
        var email = NewEmail();
        var thisDevice = api.Factory.CreateClient();
        await RegisterAsync(thisDevice, email);
        var otherDevice = api.Factory.CreateClient();
        await LoginAsync(otherDevice, email, Password);

        var response = await ChangePasswordAsync(thisDevice, Password, "New-Canvas-2026!");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await thisDevice.GetAsync("/api/auth/me", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await otherDevice.GetAsync("/api/auth/me", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(api.Factory.CreateClient(), email, Password)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, "New-Canvas-2026!")).StatusCode);
    }

    [Fact]
    public async Task A_wrong_current_password_is_a_field_error_and_changes_nothing()
    {
        var email = NewEmail();
        var client = api.Factory.CreateClient();
        await RegisterAsync(client, email);

        var response = await ChangePasswordAsync(client, "Wrong-Password-1", "New-Canvas-2026!");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await ErrorsOf(response)).TryGetProperty("currentPassword", out _));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, Password)).StatusCode);
    }

    [Fact]
    public async Task A_weak_new_password_is_rejected_on_the_new_password_field()
    {
        var client = api.Factory.CreateClient();
        await RegisterAsync(client, NewEmail());

        var response = await ChangePasswordAsync(client, Password, "weak");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await ErrorsOf(response)).TryGetProperty("newPassword", out _));
    }

    [Fact]
    public async Task Wrong_current_passwords_count_towards_the_sign_in_lockout()
    {
        var email = NewEmail();
        var client = api.Factory.CreateClient();
        await RegisterAsync(client, email);

        HttpResponseMessage last = null!;
        for (var i = 0; i < 5; i++)
            last = await ChangePasswordAsync(client, "Wrong-Password-1", "New-Canvas-2026!");

        Assert.Equal((HttpStatusCode)423, last.StatusCode);
        Assert.Equal((HttpStatusCode)423, (await LoginAsync(api.Factory.CreateClient(), email, Password)).StatusCode);
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

    [Fact]
    public async Task Asking_for_a_reset_gets_the_same_answer_for_an_unknown_email()
    {
        var known = await RegisterNewAccountAsync();
        var unknown = NewEmail();

        var forKnown = await ForgotPasswordAsync(api.Factory.CreateClient(), known);
        var forUnknown = await ForgotPasswordAsync(api.Factory.CreateClient(), unknown);

        Assert.Equal(HttpStatusCode.Accepted, forKnown.StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, forUnknown.StatusCode);
        Assert.Equal(await forKnown.Content.ReadAsStringAsync(Ct), await forUnknown.Content.ReadAsStringAsync(Ct));
        await using var db = api.CreateContext();
        Assert.False(await db.EmailOutbox.AnyAsync(m => m.ToAddress == unknown, Ct));
    }

    [Fact]
    public async Task The_emailed_link_sets_a_new_password_and_signs_out_every_session()
    {
        var email = NewEmail();
        var signedIn = api.Factory.CreateClient();
        await RegisterAsync(signedIn, email);
        await ForgotPasswordAsync(api.Factory.CreateClient(), email);
        var (userId, token) = await ResetLinkSentToAsync(email);

        var response = await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "New-Easel-2026!");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await signedIn.GetAsync("/api/auth/me", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(api.Factory.CreateClient(), email, Password)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, "New-Easel-2026!")).StatusCode);
    }

    [Fact]
    public async Task A_reset_link_works_only_once()
    {
        var email = await RegisterNewAccountAsync();
        await ForgotPasswordAsync(api.Factory.CreateClient(), email);
        var (userId, token) = await ResetLinkSentToAsync(email);
        await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "New-Easel-2026!");

        var again = await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "Other-Easel-2026!");

        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);
        Assert.Equal("INVALID_RESET_LINK", await CodeOf(again));
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, "New-Easel-2026!")).StatusCode);
    }

    [Theory]
    [InlineData("not base64 at all!")]
    [InlineData("bWFkZS11cC10b2tlbg")]   // "made-up-token", well formed but never issued
    public async Task A_made_up_reset_link_is_refused(string token)
    {
        var email = await RegisterNewAccountAsync();
        var userId = await UserIdOfAsync(email);

        var response = await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "New-Easel-2026!");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("INVALID_RESET_LINK", await CodeOf(response));
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, Password)).StatusCode);
    }

    [Fact]
    public async Task A_weak_new_password_is_a_field_error_and_keeps_the_link_usable()
    {
        var email = await RegisterNewAccountAsync();
        await ForgotPasswordAsync(api.Factory.CreateClient(), email);
        var (userId, token) = await ResetLinkSentToAsync(email);

        var weak = await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "short");
        var strong = await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "New-Easel-2026!");

        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);
        Assert.True((await ErrorsOf(weak)).TryGetProperty("newPassword", out _));
        Assert.Equal(HttpStatusCode.NoContent, strong.StatusCode);
    }

    [Fact]
    public async Task A_reset_ends_a_lockout_from_wrong_passwords()
    {
        var email = await RegisterNewAccountAsync();
        for (var i = 0; i < 5; i++)
            await LoginAsync(api.Factory.CreateClient(), email, "Wrong-Password-1");
        await ForgotPasswordAsync(api.Factory.CreateClient(), email);
        var (userId, token) = await ResetLinkSentToAsync(email);

        await ResetPasswordAsync(api.Factory.CreateClient(), userId, token, "New-Easel-2026!");

        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api.Factory.CreateClient(), email, "New-Easel-2026!")).StatusCode);
    }

    private static string NewEmail() => $"{Guid.NewGuid():N}@example.test";

    private static Task<HttpResponseMessage> ForgotPasswordAsync(HttpClient client, string email) =>
        client.PostAsJsonAsync("/api/auth/forgot-password", new { email }, Ct);

    private static Task<HttpResponseMessage> ResetPasswordAsync(HttpClient client, int userId, string token, string newPassword) =>
        client.PostAsJsonAsync("/api/auth/reset-password", new { userId, token, newPassword }, Ct);

    // The user and token from the link in the newest reset email to this address
    private async Task<(int UserId, string Token)> ResetLinkSentToAsync(string email)
    {
        await using var db = api.CreateContext();
        var message = await db.EmailOutbox
            .Where(m => m.ToAddress == email && m.Kind == EmailKind.PasswordReset)
            .OrderByDescending(m => m.Id)
            .FirstAsync(Ct);
        var link = Regex.Match(message.TextBody, @"/reset-password\?user=(\d+)&token=([A-Za-z0-9_-]+)");
        Assert.True(link.Success, "The reset email has no reset link");
        return (int.Parse(link.Groups[1].Value, CultureInfo.InvariantCulture), link.Groups[2].Value);
    }

    private async Task<int> UserIdOfAsync(string email)
    {
        await using var db = api.CreateContext();
        return await db.Users.Where(u => u.Email == email).Select(u => u.Id).SingleAsync(Ct);
    }

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

    private static Task<HttpResponseMessage> ChangePasswordAsync(HttpClient client, string currentPassword, string newPassword) =>
        client.PostAsJsonAsync("/api/auth/change-password", new { currentPassword, newPassword }, Ct);

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) =>
        response.Content.ReadFromJsonAsync<JsonElement>(Ct);

    private static async Task<string?> CodeOf(HttpResponseMessage response) =>
        (await BodyOf(response)).GetProperty("code").GetString();

    private static async Task<JsonElement> ErrorsOf(HttpResponseMessage response) =>
        (await BodyOf(response)).GetProperty("errors");
}
