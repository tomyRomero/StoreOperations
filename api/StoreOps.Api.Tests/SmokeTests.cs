using System.Net;
using System.Net.Http.Json;
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
    public async Task Anonymous_callers_learn_nothing_about_which_routes_exist()
    {
        // Deny by default covers unknown paths too: signed out, everything but the public endpoints is a 401
        var response = await _client.GetAsync("/api/does-not-exist", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Unknown_routes_return_not_found_problem_details_when_signed_in()
    {
        var client = api.Factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"smoke-{Guid.NewGuid():N}"[..20],
            email = $"{Guid.NewGuid():N}@example.test",
            password = "Paint-Brush-2026!",
        }, TestContext.Current.CancellationToken);

        var response = await client.GetAsync("/api/does-not-exist", TestContext.Current.CancellationToken);

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
