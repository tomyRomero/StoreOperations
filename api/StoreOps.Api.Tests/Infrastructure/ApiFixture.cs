using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace StoreOps.Api.Tests.Infrastructure;

// The whole API running in memory against its own test database
public sealed class ApiFixture(SqlServerFixture sql, S3MockFixture s3) : DatabaseFixture(sql)
{
    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    public override async ValueTask InitializeAsync()
    {
        await base.InitializeAsync();
        Factory = new ApiFactory(ConnectionString, s3.ServiceUrl);
    }

    public override async ValueTask DisposeAsync() => await Factory.DisposeAsync();

    private sealed class ApiFactory(string connectionString, string s3ServiceUrl) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // "Testing" never loads the developer's user secrets, so a test can't reach the dev database
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:Database", connectionString);
            builder.UseSetting("Storage:ServiceUrl", s3ServiceUrl);
            builder.UseSetting("Storage:Bucket", S3MockFixture.Bucket);
            builder.UseSetting("Storage:ForcePathStyle", "true");
            builder.UseSetting("Storage:AccessKey", "test");
            builder.UseSetting("Storage:SecretKey", "test");
            // Re-check sign-in cookies on every request, so signing out other sessions is visible at once
            builder.UseSetting("Auth:SecurityStampValidationInterval", "00:00:00");
            // Every test request comes from the same in-memory address, so the per-address limit is
            // lifted here. RateLimitTests checks the limiter with a low one.
            builder.UseSetting("RateLimits:Credentials:PermitLimit", "100000");
            // Only warnings and errors, so a failing test's output isn't buried under SQL
            builder.ConfigureLogging(logging => logging.SetMinimumLevel(LogLevel.Warning));
        }
    }
}
