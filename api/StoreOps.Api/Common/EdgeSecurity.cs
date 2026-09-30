using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Common;

public static class RateLimitPolicies
{
    // Sign-up, sign-in and password changes
    public const string Credentials = "Credentials";

    // Public forms that send email: the newsletter sign-up and the contact form
    public const string PublicForms = "PublicForms";
}

// How many requests one address may make per window, set per policy under RateLimits:<policy name>
public sealed class RateLimitOptions
{
    public int PermitLimit { get; set; }
    public TimeSpan Window { get; set; }
}

// What happens before a request reaches an endpoint: find the caller's real address, and slow down
// anyone hammering the credential endpoints or the public forms from it.
public static class EdgeSecurityExtensions
{
    public static IServiceCollection AddEdgeSecurity(this IServiceCollection services, IConfiguration configuration)
    {
        // The browser reaches the API through the Next.js server, so the connection comes from Next and
        // the browser's address arrives in X-Forwarded-For. That header is believed only from the Next
        // server (loopback by default, plus the networks configured for production) and only one hop
        // back, so a client can't choose its own address by sending the header itself.
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 1;
            foreach (var network in configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? [])
                options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
        });

        AddLimits(services, configuration, RateLimitPolicies.Credentials, permitLimit: 10, TimeSpan.FromMinutes(1));
        AddLimits(services, configuration, RateLimitPolicies.PublicForms, permitLimit: 5, TimeSpan.FromMinutes(10));

        services.AddRateLimiter(options =>
        {
            // One limit per client address, so one abusive client can't use it up for everyone else.
            // Sign-in attacks spread over many addresses are caught by the per-account lockout (LoginThrottle).
            options.AddPolicy(RateLimitPolicies.Credentials, context => PerAddress(context, RateLimitPolicies.Credentials));
            options.AddPolicy(RateLimitPolicies.PublicForms, context => PerAddress(context, RateLimitPolicies.PublicForms));

            options.OnRejected = async (rejected, _) =>
            {
                if (rejected.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    rejected.HttpContext.Response.Headers.RetryAfter =
                        Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);

                await ApiProblems.WriteAsync(rejected.HttpContext, StatusCodes.Status429TooManyRequests,
                    ErrorCodes.RateLimited, "Too many attempts. Please wait a moment and try again.");
            };
        });

        return services;
    }

    // The policy's defaults, overridden by whatever RateLimits:<policy> sets
    private static void AddLimits(
        IServiceCollection services, IConfiguration configuration, string policy, int permitLimit, TimeSpan window) =>
        services.AddOptions<RateLimitOptions>(policy)
            .Configure(limits => (limits.PermitLimit, limits.Window) = (permitLimit, window))
            .Bind(configuration.GetSection($"RateLimits:{policy}"));

    private static RateLimitPartition<string> PerAddress(HttpContext context, string policy)
    {
        var limits = context.RequestServices.GetRequiredService<IOptionsMonitor<RateLimitOptions>>().Get(policy);
        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = limits.PermitLimit, Window = limits.Window });
    }
}
