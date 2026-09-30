using System.Globalization;
using System.Security.Claims;

namespace StoreOps.Api.Auth;

public static class ClaimsPrincipalExtensions
{
    // The signed-in user's id, from the sign-in cookie. Only for endpoints that require a signed-in user.
    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!, CultureInfo.InvariantCulture);
}
