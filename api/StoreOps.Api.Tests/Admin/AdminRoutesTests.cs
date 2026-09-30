using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Auth;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminRoutesTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // Looks at every route the app really has, so a new admin endpoint is covered without a new test
    [Fact]
    public void Every_admin_route_requires_the_admin_policy()
    {
        var adminRoutes = api.Factory.Services.GetRequiredService<EndpointDataSource>().Endpoints
            .OfType<RouteEndpoint>()
            .Where(e => e.RoutePattern.RawText?.StartsWith("api/admin", StringComparison.OrdinalIgnoreCase) == true)
            .ToList();

        Assert.NotEmpty(adminRoutes);
        Assert.All(adminRoutes, route =>
        {
            Assert.Contains(route.Metadata.GetOrderedMetadata<IAuthorizeData>(), a => a.Policy == Policies.Admin);
            Assert.Null(route.Metadata.GetMetadata<IAllowAnonymous>());
        });
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

    private static async Task<string?> CodeOf(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("code").GetString();
}
