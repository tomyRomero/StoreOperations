using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Common;

public static class RateLimitPolicies
{
    // Sign-up, sign-in and password changes
    public const string Credentials = "credentials";
}

public sealed class CredentialRateLimitOptions
{
    public int PermitLimit { get; set; } = 10;
    public TimeSpan Window { get; set; } = TimeSpan.FromMinutes(1);
}

// What happens before a request reaches an endpoint: find the caller's real address, and slow down
// anyone hammering the credential endpoints from it.
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

        services.Configure<CredentialRateLimitOptions>(configuration.GetSection("RateLimits:Credentials"));
        services.AddRateLimiter(options =>
        {
            // One limit per client address, so one abusive client can't use it up for everyone else.
            // Attacks spread over many addresses are caught by the per-account lockout (LoginThrottle).
            options.AddPolicy(RateLimitPolicies.Credentials, context =>
            {
                var limits = context.RequestServices.GetRequiredService<IOptions<CredentialRateLimitOptions>>().Value;
                return RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions { PermitLimit = limits.PermitLimit, Window = limits.Window });
            });

            options.OnRejected = async (rejected, _) =>
            {
                if (rejected.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    rejected.HttpContext.Response.Headers.RetryAfter =
                        Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);

                await ApiProblems.WriteAsync(rejected.HttpContext, StatusCodes.Status429TooManyRequests,
                    ErrorCodes.RateLimited, "Too many attempts. Please wait a minute and try again.");
            };
        });

        return services;
    }
}
