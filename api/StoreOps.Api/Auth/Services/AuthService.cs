using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StoreOps.Api.Auth.Models;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails;
using StoreOps.Api.Newsletter.Services;

namespace StoreOps.Api.Auth.Services;

public enum LoginOutcome
{
    Succeeded,
    InvalidCredentials,
    Locked,
    Disabled,
}

public sealed record LoginResult(LoginOutcome Outcome, ApplicationUser? User = null, DateTimeOffset? LockedUntil = null);

public enum ChangePasswordOutcome
{
    Changed,
    WrongPassword,
    Locked,
    Invalid,
}

public sealed record ChangePasswordResult(
    ChangePasswordOutcome Outcome, DateTimeOffset? LockedUntil = null, IReadOnlyDictionary<string, string[]>? Errors = null);

public enum ResetPasswordOutcome
{
    Reset,
    InvalidLink,
    Invalid,
}

public sealed record ResetPasswordResult(ResetPasswordOutcome Outcome, IReadOnlyDictionary<string, string[]>? Errors = null);

public sealed record RegisterResult(ApplicationUser? User, bool AccountExists, IReadOnlyDictionary<string, string[]> Errors)
{
    public static RegisterResult Created(ApplicationUser user) => new(user, false, new Dictionary<string, string[]>());
    public static RegisterResult Exists() => new(null, true, new Dictionary<string, string[]>());
    public static RegisterResult Invalid(IReadOnlyDictionary<string, string[]> errors) => new(null, false, errors);
}

// Sign-up, sign-in and password changes. Every sign-in failure looks the same to the caller: nothing reveals whether
// an email is registered, whether the password was close, or which check failed.
public sealed class AuthService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    LoginThrottle throttle,
    AppDbContext db,
    StoreEmails emails,
    NewsletterService newsletter,
    IOptions<DataProtectionTokenProviderOptions> tokenOptions,
    TimeProvider clock,
    ILogger<AuthService> logger)
{
    // Names nobody may register, so no customer can pose as the store or its staff
    private static readonly HashSet<string> ReservedUsernames =
        new(StringComparer.OrdinalIgnoreCase) { "admin", "administrator", "root", "system", "support", "api", "www", "storeops" };

    // Checked when an email matches no account, so an unknown email takes as long as a wrong password
    private static readonly ApplicationUser NobodyUser = new();
    private static readonly string NobodyPasswordHash =
        new PasswordHasher<ApplicationUser>().HashPassword(NobodyUser, Guid.NewGuid().ToString());

    // Runs in a fixed order so its timing and answers can't be used to discover accounts:
    // lockout first (before any database lookup), then the password, then whether the account is disabled.
    public async Task<LoginResult> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        if (await throttle.LockedUntilAsync(request.Email, ct) is { } lockedUntil)
            return new LoginResult(LoginOutcome.Locked, LockedUntil: lockedUntil);

        var user = await users.FindByEmailAsync(request.Email);
        var passwordMatches = user is null
            ? VerifyAgainstNobody(request.Password)
            : await users.CheckPasswordAsync(user, request.Password);

        if (!passwordMatches)
        {
            var nowLockedUntil = await throttle.RecordFailureAsync(request.Email, ct);
            // Never log the email: failed sign-ins are often typos of someone's real address
            logger.LogWarning("Failed sign-in attempt. Locked: {Locked}", nowLockedUntil is not null);
            return nowLockedUntil is { } until
                ? new LoginResult(LoginOutcome.Locked, LockedUntil: until)
                : new LoginResult(LoginOutcome.InvalidCredentials);
        }

        await throttle.ClearAsync(request.Email, ct);

        // An account an admin has disabled is only revealed to someone who knows its password
        if (await users.IsLockedOutAsync(user!))
            return new LoginResult(LoginOutcome.Disabled);

        await signIn.SignInAsync(user!, isPersistent: true);
        return new LoginResult(LoginOutcome.Succeeded, user);
    }

    // Creates the account, records it in the activity log and queues the welcome email in one
    // transaction, then signs in
    public async Task<RegisterResult> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var username = request.Username.Trim().ToLowerInvariant();
        if (ReservedUsernames.Contains(username))
            return RegisterResult.Invalid(new Dictionary<string, string[]>
            {
                ["username"] = ["That username is reserved. Please choose another."],
            });

        RegisterResult result;
        try
        {
            // The connection retries transient failures, so the transaction runs as one retriable unit
            result = await db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                db.ChangeTracker.Clear();
                await using var transaction = await db.Database.BeginTransactionAsync(ct);

                var user = new ApplicationUser { UserName = username, Email = request.Email.Trim() };
                var created = await users.CreateAsync(user, request.Password);
                if (!created.Succeeded)
                    return FromIdentityErrors(created.Errors);

                db.ActivityLog.Add(new ActivityLogEntry
                {
                    Action = ActivityAction.UserRegistered,
                    EntityType = ActivityEntity.User,
                    EntityId = user.Id,
                    OccurredAtUtc = clock.GetUtcNow().UtcDateTime,
                    DetailsJson = JsonSerializer.Serialize(new { username = user.UserName }),
                });
                await emails.AddWelcomeAsync(user.UserName!, user.Email!, ct);
                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return RegisterResult.Created(user);
            });
        }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 2601 or 2627 })
        {
            // Two sign-ups for the same email or username at the same moment: the unique index decides
            return RegisterResult.Exists();
        }

        if (result.User is not null)
        {
            await signIn.SignInAsync(result.User, isPersistent: true);
            // After the account exists, on its own: a newsletter hiccup never costs the shopper their account
            if (request.SubscribeToNewsletter)
                await newsletter.SubscribeAsync(result.User.Email!, ct);
        }
        return result;
    }

    // Wrong current passwords count towards the same lockout as sign-in, so a stolen session
    // can't be used to guess the password. Changing it signs out every other session but keeps this one.
    public async Task<ChangePasswordResult> ChangePasswordAsync(
        ApplicationUser user, ChangePasswordRequest request, CancellationToken ct)
    {
        var email = user.Email!;
        if (await throttle.LockedUntilAsync(email, ct) is { } lockedUntil)
            return new ChangePasswordResult(ChangePasswordOutcome.Locked, lockedUntil);

        // Checks the current password first, then the new one against the rules. Success replaces
        // the security stamp, which is what invalidates the other sessions' cookies.
        var changed = await users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (changed.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch)))
        {
            var nowLockedUntil = await throttle.RecordFailureAsync(email, ct);
            logger.LogWarning("Wrong current password on a password change. Locked: {Locked}", nowLockedUntil is not null);
            return nowLockedUntil is { } until
                ? new ChangePasswordResult(ChangePasswordOutcome.Locked, until)
                : new ChangePasswordResult(ChangePasswordOutcome.WrongPassword);
        }

        await throttle.ClearAsync(email, ct);

        if (!changed.Succeeded)
            return new ChangePasswordResult(ChangePasswordOutcome.Invalid, Errors: new Dictionary<string, string[]>
            {
                ["newPassword"] = changed.Errors.Select(e => e.Description).ToArray(),
            });

        // A fresh cookie with the new stamp, so this session stays signed in
        await signIn.RefreshSignInAsync(user);
        logger.LogInformation("User {UserId} changed their password", user.Id);
        return new ChangePasswordResult(ChangePasswordOutcome.Changed);
    }

    // Queues a reset link when the email belongs to an account. The caller answers the same either way,
    // so the form can't be used to find out who has an account here.
    public async Task RequestPasswordResetAsync(string email, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            logger.LogInformation("Password reset asked for an email with no account");
            return;
        }

        var token = await users.GeneratePasswordResetTokenAsync(user);
        await emails.AddPasswordResetAsync(user, token, tokenOptions.Value.TokenLifespan, ct);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Password reset link sent to user {UserId}", user.Id);
    }

    // Sets the new password from the emailed link. The token is checked before the password, so a link that
    // is wrong, expired or already used says so; a weak password keeps the link usable for another try.
    // Success replaces the security stamp, which ends every session, and clears any lockout from wrong
    // passwords so the owner can sign in straight away.
    public async Task<ResetPasswordResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct)
    {
        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            return new ResetPasswordResult(ResetPasswordOutcome.InvalidLink);
        }

        var user = await users.FindByIdAsync(request.UserId.ToString(CultureInfo.InvariantCulture));
        if (user is null)
            return new ResetPasswordResult(ResetPasswordOutcome.InvalidLink);

        var reset = await users.ResetPasswordAsync(user, token, request.NewPassword);
        if (reset.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.InvalidToken)))
            return new ResetPasswordResult(ResetPasswordOutcome.InvalidLink);
        if (!reset.Succeeded)
            return new ResetPasswordResult(ResetPasswordOutcome.Invalid, new Dictionary<string, string[]>
            {
                ["newPassword"] = reset.Errors.Select(e => e.Description).ToArray(),
            });

        await throttle.EndLockAsync(user.Email!, ct);
        logger.LogInformation("User {UserId} reset their password", user.Id);
        return new ResetPasswordResult(ResetPasswordOutcome.Reset);
    }

    private bool VerifyAgainstNobody(string password)
    {
        users.PasswordHasher.VerifyHashedPassword(NobodyUser, NobodyPasswordHash, password);
        return false;
    }

    private static RegisterResult FromIdentityErrors(IEnumerable<IdentityError> errors)
    {
        var list = errors.ToList();
        if (list.Any(e => e.Code is nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName)))
            return RegisterResult.Exists();

        return RegisterResult.Invalid(list
            .GroupBy(e => e.Code switch
            {
                _ when e.Code.StartsWith("Password", StringComparison.Ordinal) => "password",
                nameof(IdentityErrorDescriber.InvalidUserName) => "username",
                nameof(IdentityErrorDescriber.InvalidEmail) => "email",
                _ => "",
            })
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()));
    }
}
