using System.Net.Http.Json;
using System.Text.Json;
using Docker.DotNet.Models;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;

namespace StoreOps.Api.Tests.Infrastructure;

// A throwaway Mailpit (the same mail catcher as development) for the email tests: a real SMTP
// server, plus an HTTP API to read what arrived
public sealed class MailpitFixture : IAsyncLifetime
{
    private const int SmtpPort = 1025;
    private const int HttpPort = 8025;

    private readonly IContainer _container = new ContainerBuilder("axllent/mailpit:v1.24")
        .WithPortBinding(SmtpPort, assignRandomHostPort: true)
        .WithPortBinding(HttpPort, assignRandomHostPort: true)
        .WithCreateParameterModifier(parameters =>
        {
            parameters.HostConfig ??= new HostConfig();
            parameters.HostConfig.Memory = 256L * 1024 * 1024;
        })
        .WithWaitStrategy(Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(request => request.ForPort(HttpPort).ForPath("/api/v1/messages")))
        .Build();

    private HttpClient _api = null!;

    public string Host => _container.Hostname;

    public int Port => _container.GetMappedPublicPort(SmtpPort);

    public async ValueTask InitializeAsync()
    {
        await _container.StartAsync();
        _api = new HttpClient { BaseAddress = new Uri($"http://{_container.Hostname}:{_container.GetMappedPublicPort(HttpPort)}") };
    }

    public async ValueTask DisposeAsync()
    {
        _api.Dispose();
        await _container.DisposeAsync();
    }

    // Every message delivered to this address: its subject and HTML
    public async Task<IReadOnlyList<(string Subject, string Html)>> MessagesToAsync(string address)
    {
        var search = await _api.GetFromJsonAsync<JsonElement>(
            $"/api/v1/search?query={Uri.EscapeDataString($"to:\"{address}\"")}", TestContext.Current.CancellationToken);

        var messages = new List<(string, string)>();
        foreach (var summary in search.GetProperty("messages").EnumerateArray())
        {
            var message = await _api.GetFromJsonAsync<JsonElement>(
                $"/api/v1/message/{summary.GetProperty("ID").GetString()}", TestContext.Current.CancellationToken);
            messages.Add((message.GetProperty("Subject").GetString()!, message.GetProperty("HTML").GetString()!));
        }
        return messages;
    }
}
