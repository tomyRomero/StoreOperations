using System.ComponentModel.DataAnnotations;

namespace StoreOps.Api.Auth.Models;

public sealed record RegisterRequest
{
    [Required, StringLength(32, MinimumLength = 3)]
    [RegularExpression("^[A-Za-z0-9._-]+$", ErrorMessage = "Use only letters, numbers, dots, dashes and underscores.")]
    public string Username { get; init; } = "";

    [Required, EmailAddress, StringLength(256)]
    public string Email { get; init; } = "";

    // The strength rules (length, character classes) are Identity's, configured in AuthServiceCollectionExtensions
    [Required, StringLength(128)]
    public string Password { get; init; } = "";

    // The box on the sign-up form, unticked unless the shopper ticks it
    public bool SubscribeToNewsletter { get; init; }
}

public sealed record LoginRequest
{
    [Required, StringLength(256)]
    public string Email { get; init; } = "";

    [Required, StringLength(128)]
    public string Password { get; init; } = "";
}

public sealed record ChangePasswordRequest
{
    [Required, StringLength(128)]
    public string CurrentPassword { get; init; } = "";

    [Required, StringLength(128)]
    public string NewPassword { get; init; } = "";
}

public sealed record ForgotPasswordRequest
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; init; } = "";
}

// From the link in the reset email: whose password, and the proof that the email reached them
public sealed record ResetPasswordRequest
{
    [Range(1, int.MaxValue)]
    public int UserId { get; init; }

    [Required, StringLength(2000)]
    public string Token { get; init; } = "";

    [Required, StringLength(128)]
    public string NewPassword { get; init; } = "";
}

public sealed record CurrentUserResponse(int Id, string Username, string Email, bool IsAdmin);
