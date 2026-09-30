using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace StoreOps.Api.Tests.Infrastructure;

// The whole API running in memory against its own test database
public sealed class ApiFixture(SqlServerFixture sql) : DatabaseFixture(sql)
{
    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    public override async ValueTask InitializeAsync()
    {
        await base.InitializeAsync();
        Factory = new ApiFactory(ConnectionString);
    }

    public override async ValueTask DisposeAsync() => await Factory.DisposeAsync();

    private sealed class ApiFactory(string connectionString) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // "Testing" never loads the developer's user secrets, so a test can't reach the dev database
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:Database", connectionString);
        }
    }
}
