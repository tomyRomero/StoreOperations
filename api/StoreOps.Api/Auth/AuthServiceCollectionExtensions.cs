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

                // The rules the store has always used: 9+ characters with an uppercase letter,
                // a number and a symbol
                options.Password.RequiredLength = 9;
                options.Password.RequireUppercase = true;
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireLowercase = false;
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();

        services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "palettehub_session";
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

        // Changing a password, removing the Admin role or disabling an account rotates the user's
        // security stamp; every cookie is re-checked against it this often and dropped if it's stale.
        services.Configure<SecurityStampValidatorOptions>(options =>
            options.ValidationInterval = configuration.GetValue("Auth:SecurityStampValidationInterval", TimeSpan.FromMinutes(1)));

        // Deny by default: every endpoint needs a signed-in user unless it is marked [AllowAnonymous]
        services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
            .AddPolicy(Policies.Admin, policy => policy.RequireRole(Roles.Admin));

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
