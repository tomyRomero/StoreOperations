using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests;

// Boots the whole API in memory and checks the basics every later feature relies on
public class SmokeTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private readonly HttpClient _client = api.Factory.CreateClient();

    [Fact]
    public async Task Health_endpoint_reports_healthy_when_the_database_is_reachable()
    {
        var response = await _client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Unknown_routes_return_problem_details()
    {
        var response = await _client.GetAsync("/api/does-not-exist", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}

// Runs in the Development environment, where the contract is published. Never touches a database.
public class OpenApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task OpenApi_contract_is_published_in_development()
    {
        var response = await factory.CreateClient().GetAsync("/openapi/v1.json", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"openapi\"", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }
}
