using System.Net;
using System.Net.Http.Json;
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

    // The serializer's own messages name the API's types and where parsing stopped. Callers get the
    // field and a plain message instead.
    [Fact]
    public async Task A_body_that_does_not_fit_is_reported_without_the_apis_internals()
    {
        var client = await api.CreateCustomerClientAsync();

        var response = await client.PostAsJsonAsync("/api/cart/items", new { productId = "seven" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"$.productId\"", body);
        Assert.DoesNotContain("StoreOps", body);
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

    // An action that declares only its errors (say [ProducesResponseType(404)]) loses the success response
    // ASP.NET Core would otherwise infer, and the web app's types then say the call never succeeds
    [Fact]
    public async Task Every_operation_says_what_it_answers_on_success()
    {
        await using var development = api.Factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
        var contract = JsonNode.Parse(await development.CreateClient().GetStringAsync("/openapi/v1.json", TestContext.Current.CancellationToken))!;

        var missing = contract["paths"]!.AsObject()
            .SelectMany(path => path.Value!.AsObject().Select(operation => (Path: path.Key, Method: operation.Key, Operation: operation.Value!)))
            .Where(o => !o.Operation["responses"]!.AsObject().Any(response => response.Key.StartsWith('2')))
            .Select(o => $"{o.Method.ToUpperInvariant()} {o.Path}");

        Assert.Empty(missing);
    }

    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !Directory.Exists(Path.Combine(directory.FullName, "web")))
            directory = directory.Parent;
        return directory?.FullName ?? throw new DirectoryNotFoundException("Couldn't find the repository root (the folder with web/).");
    }
}

// Every value the contract offers for a query-string enum is one the API accepts, including two-word
// values (entityType=store_settings) that MVC's default binder, which only knows the C# names, refuses.
public class QueryEnumTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Every_enum_value_the_contract_offers_in_a_query_string_is_accepted()
    {
        await using var development = api.Factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
        var contract = JsonNode.Parse(await development.CreateClient().GetStringAsync("/openapi/v1.json", Ct))!;
        var schemas = contract["components"]!["schemas"]!;
        var admin = await api.CreateAdminClientAsync();

        var tried = new List<string>();
        var refused = new List<string>();
        foreach (var (path, operations) in contract["paths"]!.AsObject())
        {
            if (path.Contains('{') || operations!["get"] is not { } get)
                continue;

            foreach (var parameter in get["parameters"]?.AsArray() ?? [])
            {
                if (parameter!["in"]!.GetValue<string>() != "query")
                    continue;

                foreach (var value in EnumValues(parameter["schema"]!, schemas))
                {
                    var url = $"{path}?{parameter["name"]}={value}";
                    tried.Add(url);
                    if ((await admin.GetAsync(url, Ct)).StatusCode == HttpStatusCode.BadRequest)
                        refused.Add(url);
                }
            }
        }

        Assert.Contains("/api/admin/activity?entityType=store_settings", tried);
        Assert.Empty(refused);
    }

    [Fact]
    public async Task A_value_the_contract_does_not_offer_is_a_field_error()
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await admin.GetAsync("/api/admin/activity?entityType=StoreSettings2", Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonNode>(Ct))!["errors"]!;
        Assert.NotNull(errors["entityType"]);
    }

    // The schema's enum, directly or through its $ref
    private static IEnumerable<string> EnumValues(JsonNode schema, JsonNode schemas)
    {
        if (schema["$ref"]?.GetValue<string>() is { } reference)
            schema = schemas[reference.Split('/')[^1]]!;

        return schema["enum"]?.AsArray().OfType<JsonNode>().Select(v => v.GetValue<string>()) ?? [];
    }
}
