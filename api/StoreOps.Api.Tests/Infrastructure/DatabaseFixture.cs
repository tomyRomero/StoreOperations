using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Data;

namespace StoreOps.Api.Tests.Infrastructure;

// A freshly migrated database, shared by the tests in one class
public class DatabaseFixture(SqlServerFixture sql) : IAsyncLifetime
{
    public string ConnectionString { get; } = sql.NewDatabase();

    public AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(ConnectionString)
            .AddInterceptors(new TimestampInterceptor(TimeProvider.System))
            .Options);

    public virtual async ValueTask InitializeAsync()
    {
        await using var db = CreateContext();
        await db.Database.MigrateAsync();
    }

    public virtual ValueTask DisposeAsync() => ValueTask.CompletedTask;
}
