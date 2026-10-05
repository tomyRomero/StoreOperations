using Docker.DotNet.Models;
using DotNet.Testcontainers.Builders;
using Microsoft.Data.SqlClient;
using Testcontainers.MsSql;

[assembly: AssemblyFixture(typeof(StoreOps.Api.Tests.Infrastructure.SqlServerFixture))]

namespace StoreOps.Api.Tests.Infrastructure;

// One throwaway SQL Server for the whole test run. Testcontainers starts it on a random port with a
// random password and removes it afterwards, so tests never touch the development database and
// CI needs no secrets.
public sealed class SqlServerFixture : IAsyncLifetime
{
    // The same engine as development. Capped at 2 GB, like the dev container.
    private readonly MsSqlContainer _container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
        .WithCreateParameterModifier(parameters =>
        {
            parameters.HostConfig ??= new HostConfig();
            parameters.HostConfig.Memory = 2L * 1024 * 1024 * 1024;
        })
        // Ready means "accepts a connection". On CI (x64) that takes seconds. On an Apple Silicon Mac the
        // x64 image runs under Rosetta, and translating it can take minutes on a busy machine, so the
        // limit is generous. It only decides how long a start that is truly broken takes to fail.
        .WithWaitStrategy(Wait.ForUnixContainer()
            .UntilDatabaseIsAvailable(SqlClientFactory.Instance, wait => wait.WithTimeout(TimeSpan.FromMinutes(5))))
        .Build();

    public async ValueTask InitializeAsync() => await _container.StartAsync();

    public async ValueTask DisposeAsync() => await _container.DisposeAsync();

    // A connection string for a new, uniquely named database (created by the first migration)
    public string NewDatabase() =>
        new SqlConnectionStringBuilder(_container.GetConnectionString())
        {
            InitialCatalog = $"Palettehub_Test_{Guid.NewGuid():N}",
        }.ConnectionString;
}
