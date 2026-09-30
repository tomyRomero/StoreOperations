using System.Net;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
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
        var client = await api.CreateCustomerClientAsync();

        var response = await client.GetAsync("/api/does-not-exist", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}

// Runs in the Development environment, where the contract is published. Never touches a database.
public class OpenApiTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    [Fact]
    public async Task OpenApi_contract_is_published_in_development()
    {
        // The test API switched to Development. Its test settings still win over the developer's
        // user secrets, so this never reaches the development database.
        await using var development = api.Factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));

        var response = await development.CreateClient().GetAsync("/openapi/v1.json", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"openapi\"", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    // The web app's TypeScript types are generated from a copy of the contract in web/lib/api. This
    // fails when the API changed and the copy wasn't regenerated, so a renamed field can't slip through.
    [Fact]
    public async Task The_web_apps_copy_of_the_contract_is_up_to_date()
    {
        await using var development = api.Factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
        var served = JsonNode.Parse(await development.CreateClient().GetStringAsync("/openapi/v1.json", TestContext.Current.CancellationToken));

        var copyPath = Path.Combine(RepositoryRoot(), "web", "lib", "api", "openapi.json");
        var copy = File.Exists(copyPath) ? JsonNode.Parse(await File.ReadAllTextAsync(copyPath, TestContext.Current.CancellationToken)) : null;

        Assert.True(JsonNode.DeepEquals(served, copy),
            "The API's contract changed. With the API running, run `npm run api:types` in web/ and commit web/lib/api.");
    }

    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, "web")))
            directory = directory.Parent;
        return directory?.FullName ?? throw new DirectoryNotFoundException("Couldn't find the repository root (the folder with web/).");
    }
}
