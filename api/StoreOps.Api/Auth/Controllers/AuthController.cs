using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoreOps.Api.Auth.Models;
using StoreOps.Api.Auth.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Auth.Controllers;

// Sign-up, sign-in, password changes and resets, and the session cookie. Responses are never cached anywhere.
[ApiController]
[Route("api/auth")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class AuthController(
    AuthService auth,
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    TimeProvider clock) : ControllerBase
{
    [HttpPost("register")]
    [EnableRateLimiting(RateLimitPolicies.Credentials)]
    [AllowAnonymous]
    [ProducesResponseType<CurrentUserResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        var result = await auth.RegisterAsync(request, ct);

        if (result.AccountExists)
            return this.CodedProblem(StatusCodes.Status409Conflict, ErrorCodes.AccountExists,
                "An account with that email or username already exists.");

        if (result.User is null)
        {
            foreach (var (field, messages) in result.Errors)
                foreach (var message in messages)
                    ModelState.AddModelError(field, message);
            return ValidationProblem(ModelState);
        }

        return CreatedAtAction(nameof(Me), await ToResponseAsync(result.User));
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Credentials)]
    [AllowAnonymous]
    [ProducesResponseType<CurrentUserResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await auth.LoginAsync(request, ct);

        switch (result.Outcome)
        {
            case LoginOutcome.Succeeded:
                return Ok(await ToResponseAsync(result.User!));

            case LoginOutcome.Locked:
                return Locked(result.LockedUntil!.Value);

            case LoginOutcome.Disabled:
                return this.CodedProblem(StatusCodes.Status403Forbidden, ErrorCodes.AccountDisabled,
                    "This account is disabled. Please contact the store.");

            default:
                return this.CodedProblem(StatusCodes.Status401Unauthorized, ErrorCodes.InvalidCredentials,
                    "Email or password is incorrect.");
        }
    }

    // Always succeeds, signed in or not
    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await signIn.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [ProducesResponseType<CurrentUserResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Me()
    {
        var user = await users.GetUserAsync(User);
        if (user is null)
            return await AccountGoneAsync();

        return Ok(await ToResponseAsync(user));
    }

    [HttpPost("change-password")]
    [EnableRateLimiting(RateLimitPolicies.Credentials)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        var user = await users.GetUserAsync(User);
        if (user is null)
            return await AccountGoneAsync();

        var result = await auth.ChangePasswordAsync(user, request, ct);

        switch (result.Outcome)
        {
            case ChangePasswordOutcome.Changed:
                return NoContent();

            case ChangePasswordOutcome.Locked:
                return Locked(result.LockedUntil!.Value);

            // A field error, not a 401: the session is still valid, only the typed password is wrong
            case ChangePasswordOutcome.WrongPassword:
                ModelState.AddModelError("currentPassword", "Your current password is incorrect.");
                return ValidationProblem(ModelState);

            default:
                foreach (var (field, messages) in result.Errors!)
                    foreach (var message in messages)
                        ModelState.AddModelError(field, message);
                return ValidationProblem(ModelState);
        }
    }

    // Always 202, whether or not the email has an account: the answer can't be used to find accounts
    [HttpPost("forgot-password")]
    [EnableRateLimiting(RateLimitPolicies.PublicForms)]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        await auth.RequestPasswordResetAsync(request.Email.Trim(), ct);
        return Accepted();
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting(RateLimitPolicies.Credentials)]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken ct)
    {
        var result = await auth.ResetPasswordAsync(request, ct);

        switch (result.Outcome)
        {
            case ResetPasswordOutcome.Reset:
                return NoContent();

            case ResetPasswordOutcome.InvalidLink:
                return this.CodedProblem(StatusCodes.Status400BadRequest, ErrorCodes.InvalidResetLink,
                    "This reset link has expired or was already used. Ask for a new one.");

            default:
                foreach (var (field, messages) in result.Errors!)
                    foreach (var message in messages)
                        ModelState.AddModelError(field, message);
                return ValidationProblem(ModelState);
        }
    }

    private IActionResult Locked(DateTimeOffset until)
    {
        var seconds = Math.Max(1, (int)Math.Ceiling((until - clock.GetUtcNow()).TotalSeconds));
        Response.Headers.RetryAfter = seconds.ToString(CultureInfo.InvariantCulture);
        return this.CodedProblem(StatusCodes.Status423Locked, ErrorCodes.AccountLocked,
            "Too many failed password attempts. Try again later.");
    }

    // The cookie outlived its account
    private async Task<IActionResult> AccountGoneAsync()
    {
        await signIn.SignOutAsync();
        return this.CodedProblem(StatusCodes.Status401Unauthorized, ErrorCodes.NotSignedIn, "Please sign in.");
    }

    // Read from the database, not the cookie, so a role change shows up immediately
    private async Task<CurrentUserResponse> ToResponseAsync(ApplicationUser user) =>
        new(user.Id, user.UserName!, user.Email!, await users.IsInRoleAsync(user, Roles.Admin));
}
