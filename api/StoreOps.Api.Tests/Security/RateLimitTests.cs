using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Security;

// Each test gets its own copy of the API with a limit of two attempts per address, per policy
public class RateLimitTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private const string NextServer = "127.0.0.1";

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Credential_endpoints_share_one_limit_per_address_and_say_when_to_retry()
    {
        await using var factory = WithLimitOfTwo();
        var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/login", NewSignIn(), Ct);
        await client.PostAsJsonAsync("/api/auth/login", NewSignIn(), Ct);

        var third = await client.PostAsJsonAsync("/api/auth/register",
            new { username = $"u-{Guid.NewGuid():N}"[..20], email = $"{Guid.NewGuid():N}@example.test", password = "Paint-Brush-2026!" }, Ct);

        Assert.Equal(HttpStatusCode.TooManyRequests, third.StatusCode);
        Assert.Equal("RATE_LIMITED", (await third.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("code").GetString());
        Assert.InRange(third.Headers.RetryAfter?.Delta?.TotalSeconds ?? 0, 1, 60);
    }

    [Fact]
    public async Task Browsers_behind_the_web_server_each_get_their_own_limit()
    {
        await using var factory = WithLimitOfTwo();
        await SignInFromAsync(factory, NextServer, forwardedFor: "198.51.100.1");
        await SignInFromAsync(factory, NextServer, forwardedFor: "198.51.100.1");

        Assert.Equal(StatusCodes.Status429TooManyRequests, await SignInFromAsync(factory, NextServer, forwardedFor: "198.51.100.1"));
        Assert.Equal(StatusCodes.Status401Unauthorized, await SignInFromAsync(factory, NextServer, forwardedFor: "198.51.100.2"));
    }

    [Fact]
    public async Task A_forwarded_address_is_ignored_unless_it_comes_from_the_web_server()
    {
        await using var factory = WithLimitOfTwo();
        await SignInFromAsync(factory, "203.0.113.20", forwardedFor: "198.51.100.3");
        await SignInFromAsync(factory, "203.0.113.20", forwardedFor: "198.51.100.4");

        Assert.Equal(StatusCodes.Status429TooManyRequests, await SignInFromAsync(factory, "203.0.113.20", forwardedFor: "198.51.100.5"));
    }

    [Fact]
    public async Task The_public_forms_share_their_own_limit()
    {
        await using var factory = WithLimitOfTwo();
        var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/newsletter", new { email = $"{Guid.NewGuid():N}@example.test" }, Ct);
        await client.PostAsJsonAsync("/api/newsletter", new { email = $"{Guid.NewGuid():N}@example.test" }, Ct);

        var contact = await client.PostAsJsonAsync("/api/contact",
            new { name = "Ada", email = "ada@example.test", subject = "Hello", message = "A question about brushes." }, Ct);
        var signIn = await client.PostAsJsonAsync("/api/auth/login", NewSignIn(), Ct);

        Assert.Equal(HttpStatusCode.TooManyRequests, contact.StatusCode);
        // Signing in is counted separately
        Assert.Equal(HttpStatusCode.Unauthorized, signIn.StatusCode);
    }

    private WebApplicationFactory<Program> WithLimitOfTwo() =>
        api.Factory.WithWebHostBuilder(builder => builder
            .UseSetting("RateLimits:Credentials:PermitLimit", "2")
            .UseSetting("RateLimits:PublicForms:PermitLimit", "2"));

    // A failed sign-in for a new email each time, so the per-account lockout never gets involved
    private static object NewSignIn() => new { email = $"{Guid.NewGuid():N}@example.test", password = "Wrong-Password-1" };

    // Sends the request straight to the in-memory server, which lets it set the connection's address
    private static async Task<int> SignInFromAsync(WebApplicationFactory<Program> factory, string address, string forwardedFor)
    {
        var context = await factory.Server.SendAsync(request =>
        {
            request.Connection.RemoteIpAddress = IPAddress.Parse(address);
            request.Request.Method = HttpMethods.Post;
            request.Request.Path = "/api/auth/login";
            request.Request.Headers["X-Forwarded-For"] = forwardedFor;
            request.Request.ContentType = "application/json";
            request.Request.Body = new MemoryStream(JsonSerializer.SerializeToUtf8Bytes(NewSignIn()));
        }, Ct);
        return context.Response.StatusCode;
    }
}
