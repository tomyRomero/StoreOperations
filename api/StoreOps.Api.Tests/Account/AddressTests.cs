using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Account;

public class AddressTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task The_first_address_becomes_the_default()
    {
        var customer = await api.CreateCustomerClientAsync();

        var response = await AddAsync(customer, "Ada Lovelace");

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var address = await BodyOf(response);
        Assert.True(address.GetProperty("isDefault").GetBoolean());
        Assert.Equal($"/api/account/addresses/{address.GetProperty("id").GetInt32()}", response.Headers.Location?.AbsolutePath);
    }

    [Fact]
    public async Task Addresses_are_stored_tidied_up()
    {
        var customer = await api.CreateCustomerClientAsync();

        var address = await BodyOf(await customer.PostAsJsonAsync("/api/account/addresses", new
        {
            recipientName = "  Grace Hopper ",
            line1 = "1 Navy Yard",
            line2 = "   ",
            city = "Arlington",
            state = "VA",
            postalCode = "22202",
            countryCode = "us",
        }, Ct));

        Assert.Equal("Grace Hopper", address.GetProperty("recipientName").GetString());
        Assert.Equal(JsonValueKind.Null, address.GetProperty("line2").ValueKind);
        Assert.Equal("US", address.GetProperty("countryCode").GetString());
    }

    [Fact]
    public async Task Choosing_another_default_leaves_exactly_one()
    {
        var customer = await api.CreateCustomerClientAsync();
        var first = await IdOf(await AddAsync(customer, "First"));
        var second = await IdOf(await AddAsync(customer, "Second"));

        var book = await BodyOf(await customer.PostAsync($"/api/account/addresses/{second}/default", null, Ct));

        var defaults = book.EnumerateArray().Where(a => a.GetProperty("isDefault").GetBoolean()).ToList();
        Assert.Equal(second, Assert.Single(defaults).GetProperty("id").GetInt32());
        // The default is listed first
        Assert.Equal(second, book[0].GetProperty("id").GetInt32());
        Assert.Contains(book.EnumerateArray(), a => a.GetProperty("id").GetInt32() == first);
    }

    [Fact]
    public async Task A_new_address_can_take_over_as_default()
    {
        var customer = await api.CreateCustomerClientAsync();
        await AddAsync(customer, "Old home");

        var created = await BodyOf(await AddAsync(customer, "New home", isDefault: true));
        var book = await customer.GetFromJsonAsync<JsonElement>("/api/account/addresses", Ct);

        Assert.True(created.GetProperty("isDefault").GetBoolean());
        Assert.Single(book.EnumerateArray(), a => a.GetProperty("isDefault").GetBoolean());
    }

    [Fact]
    public async Task Deleting_the_default_makes_the_newest_remaining_address_the_default()
    {
        var customer = await api.CreateCustomerClientAsync();
        var home = await IdOf(await AddAsync(customer, "Home"));
        await AddAsync(customer, "Office");
        var studio = await IdOf(await AddAsync(customer, "Studio"));

        var deleted = await customer.DeleteAsync($"/api/account/addresses/{home}", Ct);
        var book = await customer.GetFromJsonAsync<JsonElement>("/api/account/addresses", Ct);

        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(2, book.GetArrayLength());
        Assert.Equal(studio, Assert.Single(book.EnumerateArray(), a => a.GetProperty("isDefault").GetBoolean()).GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task Editing_an_address_changes_its_fields()
    {
        var customer = await api.CreateCustomerClientAsync();
        var id = await IdOf(await AddAsync(customer, "Before"));

        var response = await customer.PutAsJsonAsync($"/api/account/addresses/{id}", Address("After"), Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("After", (await BodyOf(response)).GetProperty("recipientName").GetString());
    }

    [Fact]
    public async Task Another_customers_address_does_not_exist_for_you()
    {
        var owner = await api.CreateCustomerClientAsync();
        var stranger = await api.CreateCustomerClientAsync();
        var id = await IdOf(await AddAsync(owner, "Private"));

        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync($"/api/account/addresses/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PutAsJsonAsync($"/api/account/addresses/{id}", Address("Mine now"), Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PostAsync($"/api/account/addresses/{id}/default", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.DeleteAsync($"/api/account/addresses/{id}", Ct)).StatusCode);
        Assert.Equal("Private", (await owner.GetFromJsonAsync<JsonElement>($"/api/account/addresses/{id}", Ct)).GetProperty("recipientName").GetString());
    }

    [Theory]
    [InlineData("USA")]
    [InlineData("1A")]
    [InlineData("")]
    public async Task A_country_must_be_a_two_letter_code(string countryCode)
    {
        var customer = await api.CreateCustomerClientAsync();

        var response = await customer.PostAsJsonAsync("/api/account/addresses", Address("Anyone") with { CountryCode = countryCode }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await BodyOf(response)).GetProperty("errors").TryGetProperty("countryCode", out _));
    }

    [Fact]
    public async Task An_address_book_holds_up_to_20_addresses()
    {
        var customer = await api.CreateCustomerClientAsync();
        for (var i = 0; i < 20; i++)
            Assert.Equal(HttpStatusCode.Created, (await AddAsync(customer, $"Place {i}")).StatusCode);

        var twentyFirst = await AddAsync(customer, "One too many");

        Assert.Equal(HttpStatusCode.Conflict, twentyFirst.StatusCode);
        Assert.Equal("ADDRESS_BOOK_FULL", (await BodyOf(twentyFirst)).GetProperty("code").GetString());
    }

    private sealed record AddressBody(
        string RecipientName, string Line1, string? Line2, string City, string? State, string? PostalCode, string CountryCode, bool IsDefault = false);

    private static AddressBody Address(string recipientName, bool isDefault = false) =>
        new(recipientName, "12 Canvas Street", null, "Portland", "OR", "97201", "US", isDefault);

    private static Task<HttpResponseMessage> AddAsync(HttpClient client, string recipientName, bool isDefault = false) =>
        client.PostAsJsonAsync("/api/account/addresses", Address(recipientName, isDefault), Ct);

    private static async Task<int> IdOf(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await BodyOf(response)).GetProperty("id").GetInt32();
    }

    private static Task<JsonElement> BodyOf(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<JsonElement>(Ct);
}
