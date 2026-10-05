using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using StoreOps.Api.Tests.Infrastructure;

namespace StoreOps.Api.Tests.Admin;

public class AdminImagesTests(ApiFixture api) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("jpg", "image/jpeg")]
    [InlineData("png", "image/png")]
    [InlineData("webp", "image/webp")]
    public async Task Admins_can_upload_jpeg_png_and_webp_images(string extension, string contentType)
    {
        var admin = await api.CreateAdminClientAsync();
        var bytes = SampleOf(extension);

        // The file name and declared type are deliberately wrong: only the bytes count
        var response = await UploadAsync(admin, bytes, "upload.bin", "application/octet-stream");

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
        var key = body.GetProperty("key").GetString()!;
        Assert.Matches($"^images/[0-9a-f]{{32}}\\.{extension}$", key);
        Assert.Equal($"/api/images/{key}", body.GetProperty("url").GetString());
        Assert.Equal($"/api/images/{key}", response.Headers.Location?.OriginalString);

        var image = await admin.GetAsync($"/api/images/{key}", Ct);
        Assert.Equal(contentType, image.Content.Headers.ContentType?.MediaType);
        Assert.Equal(bytes, await image.Content.ReadAsByteArrayAsync(Ct));
    }

    [Fact]
    public async Task A_file_that_only_claims_to_be_an_image_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await UploadAsync(admin, "<html><script>alert(1)</script></html>"u8.ToArray(), "photo.jpg", "image/jpeg");

        await AssertFileErrorAsync(response);
    }

    [Fact]
    public async Task Images_over_5_MB_are_refused()
    {
        var admin = await api.CreateAdminClientAsync();
        var bytes = new byte[5 * 1024 * 1024 + 1];
        SampleOf("jpg").CopyTo(bytes, 0);

        var response = await UploadAsync(admin, bytes, "huge.jpg", "image/jpeg");

        await AssertFileErrorAsync(response);
    }

    [Fact]
    public async Task A_form_without_an_image_is_refused()
    {
        var admin = await api.CreateAdminClientAsync();

        var response = await admin.PostAsync("/api/admin/images",
            new MultipartFormDataContent { { new StringContent("no file chosen"), "note" } }, Ct);

        await AssertFileErrorAsync(response);
    }

    // The first bytes of each format, followed by filler
    private static byte[] SampleOf(string extension)
    {
        byte[] header = extension switch
        {
            "jpg" => [0xFF, 0xD8, 0xFF, 0xE0],
            "png" => [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
            _ => [.. "RIFF"u8, 0x24, 0x00, 0x00, 0x00, .. "WEBPVP8 "u8],
        };
        return [.. header, .. Encoding.ASCII.GetBytes("sample image body")];
    }

    private static Task<HttpResponseMessage> UploadAsync(HttpClient client, byte[] bytes, string fileName, string contentType)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return client.PostAsync("/api/admin/images", new MultipartFormDataContent { { file, "file", fileName } }, Ct);
    }

    private static async Task AssertFileErrorAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("errors");
        Assert.True(errors.TryGetProperty("file", out _), errors.ToString());
    }
}
