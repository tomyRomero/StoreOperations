using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Auth;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Security;

// Looks at every route the app really has, so a new endpoint is covered without a new test
public class RouteAccessTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public void Every_admin_route_requires_the_admin_policy()
    {
        var adminRoutes = Routes()
            .Where(e => e.RoutePattern.RawText?.StartsWith("api/admin", StringComparison.OrdinalIgnoreCase) == true)
            .ToList();

        Assert.NotEmpty(adminRoutes);
        Assert.All(adminRoutes, route =>
        {
            Assert.Contains(route.Metadata.GetOrderedMetadata<IAuthorizeData>(), a => a.Policy == Policies.Admin);
            Assert.Null(route.Metadata.GetMetadata<IAllowAnonymous>());
        });
    }

    // Everything else needs a signed-in user, so opening a route to visitors has to be done here on purpose
    [Fact]
    public void Only_the_routes_meant_for_visitors_are_open_without_signing_in()
    {
        var open = Routes()
            .Where(e => e.Metadata.GetMetadata<IAllowAnonymous>() is not null)
            .Select(e => $"{string.Join(",", e.Metadata.GetMetadata<IHttpMethodMetadata>()?.HttpMethods ?? ["ANY"])} {e.RoutePattern.RawText!.TrimStart('/')}");

        string[] meantForVisitors =
        [
            "ANY health",
            "GET api/store",
            "GET api/categories",
            "GET api/products",
            "GET api/products/{id:int}",
            "GET api/products/{id:int}/related",
            "GET api/images/{**key}",
            "POST api/cart/preview",
            "POST api/auth/register",
            "POST api/auth/login",
            "POST api/auth/logout",
            "POST api/auth/forgot-password",
            "POST api/auth/reset-password",
            "POST api/checkout/guest",
            "GET api/checkout/result",
            "POST api/stripe/webhook",
            "GET api/orders/{accessToken}",
            "POST api/orders/find",
            "POST api/newsletter",
            "POST api/newsletter/unsubscribe/{token}",
            "POST api/contact",
        ];
        Assert.Equal(meantForVisitors.Order(StringComparer.Ordinal), open.Order(StringComparer.Ordinal));
    }

    [Fact]
    public async Task Customers_are_refused_and_visitors_are_asked_to_sign_in()
    {
        var customer = await api.CreateCustomerClientAsync();
        var visitor = api.Factory.CreateClient();

        var asCustomer = await customer.PostAsync("/api/admin/images", new MultipartFormDataContent(), Ct);
        var asVisitor = await visitor.PostAsync("/api/admin/images", new MultipartFormDataContent(), Ct);

        Assert.Equal(HttpStatusCode.Forbidden, asCustomer.StatusCode);
        Assert.Equal("FORBIDDEN", await CodeOf(asCustomer));
        Assert.Equal(HttpStatusCode.Unauthorized, asVisitor.StatusCode);
        Assert.Equal("NOT_SIGNED_IN", await CodeOf(asVisitor));
    }

    private List<RouteEndpoint> Routes() =>
        api.Factory.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToList();

    private static async Task<string?> CodeOf(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("code").GetString();
}
