using System.Net;
using Microsoft.Extensions.DependencyInjection;
using StoreOps.Api.Images;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Images;

public class ImagesTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static readonly byte[] JpegBytes = [0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3, 4];

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Anyone_can_fetch_an_image_and_cache_it_for_a_year()
    {
        var key = $"images/{Guid.NewGuid():N}.jpg";
        await api.Factory.Services.GetRequiredService<ImageStorage>().PutAsync(key, JpegBytes, "image/jpeg", Ct);

        var response = await api.Factory.CreateClient().GetAsync($"/api/images/{key}", Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/jpeg", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(JpegBytes, await response.Content.ReadAsByteArrayAsync(Ct));
        Assert.True(response.Headers.CacheControl?.Public);
        Assert.Equal(TimeSpan.FromDays(365), response.Headers.CacheControl?.MaxAge);
        Assert.Contains("nosniff", response.Headers.GetValues("X-Content-Type-Options"));
    }

    [Fact]
    public async Task A_missing_image_is_not_found()
    {
        var response = await api.Factory.CreateClient().GetAsync($"/api/images/images/{Guid.NewGuid():N}.jpg", Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("images/drawing.svg")]
    [InlineData("images/Photo.JPG")]
    [InlineData("backups/database.jpg")]
    [InlineData("images/page.jpg.html")]
    public async Task Keys_the_api_never_makes_are_refused(string key)
    {
        var response = await api.Factory.CreateClient().GetAsync($"/api/images/{key}", Ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
