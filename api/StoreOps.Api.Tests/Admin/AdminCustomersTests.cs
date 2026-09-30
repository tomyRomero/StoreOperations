using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Auth;
using StoreOps.Api.Domain;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminCustomersTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Accounts_are_listed_newest_first_and_found_by_name_email_or_id()
    {
        var admin = await api.CreateAdminClientAsync();
        var older = await MeAsync(await api.CreateCustomerClientAsync());
        var newer = await MeAsync(await api.CreateCustomerClientAsync());

        var ids = (await ListAsync(admin, "pageSize=100")).Select(c => c.GetProperty("id").GetInt32()).ToList();
        var byEmail = Assert.Single(await ListAsync(admin, $"search={Uri.EscapeDataString(older.Email)}"));
        var byName = Assert.Single(await ListAsync(admin, $"search={newer.Username}"));
        var byId = await ListAsync(admin, $"search={older.Id}");

        Assert.Equal(new[] { newer.Id, older.Id }, ids.Where(id => id == newer.Id || id == older.Id));
        Assert.Equal(older.Id, byEmail.GetProperty("id").GetInt32());
        Assert.Equal(newer.Id, byName.GetProperty("id").GetInt32());
        Assert.Contains(byId, c => c.GetProperty("id").GetInt32() == older.Id);
    }

    [Fact]
    public async Task Accounts_can_be_filtered_by_role()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminId = (await MeAsync(admin)).Id;
        var customerId = (await MeAsync(await api.CreateCustomerClientAsync())).Id;

        var admins = await ListAsync(admin, "role=admin&pageSize=100");
        var customers = await ListAsync(admin, "role=customer&pageSize=100");

        Assert.All(admins, a => Assert.True(a.GetProperty("isAdmin").GetBoolean()));
        Assert.Contains(admins, a => a.GetProperty("id").GetInt32() == adminId);
        Assert.All(customers, c => Assert.False(c.GetProperty("isAdmin").GetBoolean()));
        Assert.Contains(customers, c => c.GetProperty("id").GetInt32() == customerId);
    }

    [Fact]
    public async Task The_customer_page_shows_addresses_recent_orders_and_what_they_spent()
    {
        var admin = await api.CreateAdminClientAsync();
        var sale = await api.PaidCheckoutAsync(priceCents: 2000);
        await api.WebhookArrivesAsync(sale);
        var me = await MeAsync(sale.Customer);
        await using var db = api.CreateContext();
        var order = await db.Orders.SingleAsync(o => o.UserId == me.Id, Ct);

        var customer = await GetAsync(admin, me.Id);

        Assert.Equal(sale.Email, customer.GetProperty("email").GetString());
        Assert.Equal(1, customer.GetProperty("orderCount").GetInt32());
        Assert.Equal(order.TotalCents, customer.GetProperty("spentCents").GetInt32());
        Assert.Equal("1 Easel Way", Assert.Single(customer.GetProperty("addresses").EnumerateArray()).GetProperty("line1").GetString());
        Assert.Equal(order.OrderNumber, Assert.Single(customer.GetProperty("recentOrders").EnumerateArray()).GetProperty("orderNumber").GetString());

        // Their orders in the orders list, and a cancelled order no longer counts as spent
        var theirs = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders?customerId={me.Id}", Ct);
        Assert.Equal(order.OrderNumber, Assert.Single(theirs.GetProperty("items").EnumerateArray()).GetProperty("orderNumber").GetString());
        var opened = await admin.GetFromJsonAsync<JsonElement>($"/api/admin/orders/{order.OrderNumber}", Ct);
        await admin.PutAsJsonAsync($"/api/admin/orders/{order.OrderNumber}",
            new { status = "cancelled", rowVersion = opened.GetProperty("rowVersion").GetString() }, Ct);
        Assert.Equal(0, (await GetAsync(admin, me.Id)).GetProperty("spentCents").GetInt32());
    }

    [Fact]
    public async Task Disabling_a_customer_ends_their_sessions_and_stops_them_signing_in()
    {
        var admin = await api.CreateAdminClientAsync();
        var adminId = (await MeAsync(admin)).Id;
        var laptop = await api.CreateCustomerClientAsync();
        var me = await MeAsync(laptop);
        var phone = await api.SignInAsync(me.Email, ApiFixture.Password);

        var response = await admin.PostAsync($"/api/admin/customers/{me.Id}/disable", null, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("isDisabled").GetBoolean());
        Assert.Equal(HttpStatusCode.Unauthorized, (await laptop.GetAsync("/api/auth/me", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await phone.GetAsync("/api/auth/me", Ct)).StatusCode);
        var signIn = await LoginAsync(me.Email);
        Assert.Equal(HttpStatusCode.Forbidden, signIn.StatusCode);
        Assert.Equal("ACCOUNT_DISABLED", (await BodyOf(signIn)).GetProperty("code").GetString());

        await using var db = api.CreateContext();
        var entry = await db.ActivityLog.SingleAsync(e => e.Action == ActivityAction.CustomerDisabled && e.EntityId == me.Id, Ct);
        Assert.Equal(adminId, entry.ActorUserId);
    }

    [Fact]
    public async Task An_enabled_customer_can_sign_in_again()
    {
        var admin = await api.CreateAdminClientAsync();
        var me = await MeAsync(await api.CreateCustomerClientAsync());
        await admin.PostAsync($"/api/admin/customers/{me.Id}/disable", null, Ct);

        var response = await admin.PostAsync($"/api/admin/customers/{me.Id}/enable", null, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False((await BodyOf(response)).GetProperty("isDisabled").GetBoolean());
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(me.Email)).StatusCode);
    }

    [Fact]
    public async Task Admin_accounts_cannot_be_disabled_from_the_dashboard()
    {
        var admin = await api.CreateAdminClientAsync();
        var self = (await MeAsync(admin)).Id;
        var other = (await MeAsync(await api.CreateAdminClientAsync())).Id;

        var responses = new[]
        {
            await admin.PostAsync($"/api/admin/customers/{self}/disable", null, Ct),
            await admin.PostAsync($"/api/admin/customers/{other}/disable", null, Ct),
        };

        Assert.All(responses, r => Assert.Equal(HttpStatusCode.Conflict, r.StatusCode));
        Assert.Equal("ADMIN_ACCOUNT", (await BodyOf(responses[0])).GetProperty("code").GetString());
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/auth/me", Ct)).StatusCode);
    }

    [Fact]
    public async Task An_unknown_account_is_not_found()
    {
        var admin = await api.CreateAdminClientAsync();

        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync("/api/admin/customers/999999", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.PostAsync("/api/admin/customers/999999/disable", null, Ct)).StatusCode);
    }

    [Fact]
    public async Task The_server_command_makes_and_removes_admins()
    {
        var client = await api.CreateCustomerClientAsync();
        var me = await MeAsync(client);

        var (granted, grantOutput) = await RunCommandAsync(AdminCommands.MakeAdmin, me.Email);
        var asAdmin = await client.GetAsync("/api/admin/customers", Ct);
        var (removed, _) = await RunCommandAsync(AdminCommands.RemoveAdmin, me.Email);
        var asCustomer = await client.GetAsync("/api/admin/customers", Ct);

        Assert.Equal(0, granted);
        Assert.Contains("is now an admin", grantOutput);
        Assert.Equal(HttpStatusCode.OK, asAdmin.StatusCode);
        Assert.Equal(0, removed);
        Assert.Equal(HttpStatusCode.Forbidden, asCustomer.StatusCode);

        // Done on the server, so no admin is named
        await using var db = api.CreateContext();
        var entries = await db.ActivityLog.Where(e => e.EntityType == ActivityEntity.User && e.EntityId == me.Id && e.ActorUserId == null)
            .Select(e => e.Action).ToListAsync(Ct);
        Assert.Contains(ActivityAction.AdminRoleGranted, entries);
        Assert.Contains(ActivityAction.AdminRoleRemoved, entries);
    }

    [Fact]
    public async Task The_server_command_needs_an_existing_account()
    {
        var (exitCode, output) = await RunCommandAsync(AdminCommands.MakeAdmin, "nobody@example.test");

        Assert.Equal(1, exitCode);
        Assert.Contains("No account uses nobody@example.test", output);
    }

    private sealed record Me(int Id, string Username, string Email);

    private static async Task<Me> MeAsync(HttpClient client)
    {
        var me = await client.GetFromJsonAsync<JsonElement>("/api/auth/me", Ct);
        return new Me(me.GetProperty("id").GetInt32(), me.GetProperty("username").GetString()!, me.GetProperty("email").GetString()!);
    }

    private static async Task<List<JsonElement>> ListAsync(HttpClient admin, string query) =>
        (await admin.GetFromJsonAsync<JsonElement>($"/api/admin/customers?{query}", Ct)).GetProperty("items").EnumerateArray().ToList();

    private static Task<JsonElement> GetAsync(HttpClient admin, int id) =>
        admin.GetFromJsonAsync<JsonElement>($"/api/admin/customers/{id}", Ct);

    private Task<HttpResponseMessage> LoginAsync(string email) =>
        api.Factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { email, password = ApiFixture.Password }, Ct);

    private async Task<(int ExitCode, string Output)> RunCommandAsync(string command, string email)
    {
        await using var output = new StringWriter();
        var exitCode = await AdminCommands.RunAsync(api.Factory.Services, command, email, output);
        return (exitCode, output.ToString());
    }

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
