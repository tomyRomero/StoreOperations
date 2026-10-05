using Microsoft.AspNetCore.Identity;

namespace StoreOps.Api.Domain;

// An account. Identity owns the login columns (email, password hash, lockout);
// admins are users in the Admin role.
public class ApplicationUser : IdentityUser<int>, ICreatedAt
{
    // Created at the customer's first checkout, not at sign-up
    public string? StripeCustomerId { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}

public static class Roles
{
    public const string Admin = "Admin";
}
