namespace StoreOps.Api.Checkouts;

// Makes a guest's checkout theirs: the key to it, in a cookie only the checkout API receives and
// JavaScript can never read
public static class GuestCheckoutCookie
{
    public const string Name = "storeops_checkout";

    public static void Append(HttpResponse response, string guestKey, IHostEnvironment environment) =>
        response.Cookies.Append(Name, guestKey, new CookieOptions
        {
            HttpOnly = true,
            // Lax, like the sign-in cookie: the guest comes back from Stripe through a cross-site redirect
            SameSite = SameSiteMode.Lax,
            Secure = !(environment.IsDevelopment() || environment.IsEnvironment("Testing")),
            Path = "/api/checkout",
            MaxAge = TimeSpan.FromDays(7),
        });
}
