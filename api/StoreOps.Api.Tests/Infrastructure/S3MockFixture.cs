using Docker.DotNet.Models;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;

[assembly: AssemblyFixture(typeof(StoreOps.Api.Tests.Infrastructure.S3MockFixture))]

namespace StoreOps.Api.Tests.Infrastructure;

// One throwaway S3-compatible server (Adobe S3Mock, the same one as development) for the whole run,
// so image code is tested against a real S3 API, not a fake.
public sealed class S3MockFixture : IAsyncLifetime
{
    public const string Bucket = "palettehub-test";
    private const int Port = 9090;

    private readonly IContainer _container = new ContainerBuilder("adobe/s3mock:5.2.3")
        .WithEnvironment("COM_ADOBE_TESTING_S3MOCK_STORE_INITIAL_BUCKETS", Bucket)
        .WithPortBinding(Port, assignRandomHostPort: true)
        .WithCreateParameterModifier(parameters =>
        {
            parameters.HostConfig ??= new HostConfig();
            parameters.HostConfig.Memory = 512L * 1024 * 1024;
        })
        // Ready when it answers S3's "list buckets"
        .WithWaitStrategy(Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(request => request.ForPort(Port).ForPath("/")))
        .Build();

    public string ServiceUrl => $"http://{_container.Hostname}:{_container.GetMappedPublicPort(Port)}";

    public async ValueTask InitializeAsync() => await _container.StartAsync();

    public async ValueTask DisposeAsync() => await _container.DisposeAsync();
}
