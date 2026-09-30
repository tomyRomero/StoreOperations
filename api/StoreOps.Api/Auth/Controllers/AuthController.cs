using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Auth.Models;
using StoreOps.Api.Auth.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Auth.Controllers;

// Sign-up, sign-in and the session cookie. Responses are never cached anywhere.
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
                var seconds = Math.Max(1, (int)Math.Ceiling((result.LockedUntil!.Value - clock.GetUtcNow()).TotalSeconds));
                Response.Headers.RetryAfter = seconds.ToString(CultureInfo.InvariantCulture);
                return this.CodedProblem(StatusCodes.Status423Locked, ErrorCodes.AccountLocked,
                    "Too many failed sign-in attempts. Try again later.");

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
        {
            // The cookie outlived its account
            await signIn.SignOutAsync();
            return this.CodedProblem(StatusCodes.Status401Unauthorized, ErrorCodes.NotSignedIn, "Please sign in.");
        }

        return Ok(await ToResponseAsync(user));
    }

    // Read from the database, not the cookie, so a role change shows up immediately
    private async Task<CurrentUserResponse> ToResponseAsync(ApplicationUser user) =>
        new(user.Id, user.UserName!, user.Email!, await users.IsInRoleAsync(user, Roles.Admin));
}
