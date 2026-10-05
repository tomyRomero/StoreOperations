using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using StoreOps.Api.Auth.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Auth;

public static class Policies
{
    public const string Admin = "Admin";
    // A signed-in customer. Admin accounts run the store and don't buy from it, so their orders never
    // mix with customers' in the reports; they test checkout as a guest.
    public const string Shopper = "Shopper";
}

public static class AuthServiceCollectionExtensions
{
    public static IServiceCollection AddStoreOpsAuth(
        this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyz0123456789._-";

                // 9+ characters with an uppercase letter, a number and a symbol
                options.Password.RequiredLength = 9;
                options.Password.RequireUppercase = true;
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireLowercase = false;
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        // Password reset links work for an hour. Their tokens are tied to the security stamp, so a link
        // also stops working once the password changes (including by using that link).
        services.Configure<DataProtectionTokenProviderOptions>(options =>
            options.TokenLifespan = configuration.GetValue("Auth:PasswordResetLinkLifespan", TimeSpan.FromHours(1)));

        services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "storeops_session";
            // JavaScript can never read it
            options.Cookie.HttpOnly = true;
            // Lax, not Strict: customers come back from Stripe's payment page through a cross-site
            // redirect and must still be signed in. Cross-site POSTs don't carry it.
            options.Cookie.SameSite = SameSiteMode.Lax;
            // HTTPS-only everywhere except local development and tests, which run on plain HTTP
            options.Cookie.SecurePolicy = environment.IsDevelopment() || environment.IsEnvironment("Testing")
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
            options.ExpireTimeSpan = TimeSpan.FromDays(7);
            options.SlidingExpiration = true;

            // This is an API: answer 401/403 as JSON instead of redirecting to a login page
            options.Events.OnRedirectToLogin = context =>
                ApiProblems.WriteAsync(context.HttpContext, StatusCodes.Status401Unauthorized, ErrorCodes.NotSignedIn, "Please sign in.");
            options.Events.OnRedirectToAccessDenied = context =>
                ApiProblems.WriteAsync(context.HttpContext, StatusCodes.Status403Forbidden, ErrorCodes.Forbidden,
                    "You don't have access to this.");
        });

        // Every sign-in cookie is re-checked against the database this often. A changed security stamp
        // (a new password) ends the session, and roles are re-read, so removing the Admin role takes
        // effect too. Setting a lockout does not change the stamp: disabling an account must also
        // call UpdateSecurityStampAsync to end its sessions.
        services.Configure<SecurityStampValidatorOptions>(options =>
            options.ValidationInterval = configuration.GetValue("Auth:SecurityStampValidationInterval", TimeSpan.FromMinutes(1)));

        // Deny by default: every endpoint needs a signed-in user unless it is marked [AllowAnonymous]
        services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
            .AddPolicy(Policies.Admin, policy => policy.RequireRole(Roles.Admin))
            .AddPolicy(Policies.Shopper, policy => policy
                .RequireAuthenticatedUser()
                .RequireAssertion(context => !context.User.IsInRole(Roles.Admin)));

        // The keys that encrypt the cookie live in the database, so sign-ins survive a restart and
        // work across several API instances
        services.AddDataProtection()
            .SetApplicationName("StoreOps.Api")
            .PersistKeysToDbContext<AppDbContext>();

        services.AddDistributedMemoryCache();
        services.Configure<LoginThrottleOptions>(configuration.GetSection("Auth:LoginThrottle"));
        services.AddSingleton<LoginThrottle>();
        services.AddScoped<AuthService>();

        return services;
    }
}
