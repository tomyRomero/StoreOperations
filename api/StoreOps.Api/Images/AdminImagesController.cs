using Microsoft.AspNetCore.Mvc;
using StoreOps.Api.Common;

namespace StoreOps.Api.Images;

public sealed record UploadedImageResponse(string Key, string Url);

[Route("api/admin/images")]
public sealed class AdminImagesController(ImageStorage images) : AdminControllerBase
{
    public const int MaxBytes = 5 * 1024 * 1024;

    // Room for the multipart wrapping around the file
    private const int MaxRequestBytes = MaxBytes + 64 * 1024;

    // Upload first, then save the returned key on a product or category. The API names the file,
    // so an upload can never overwrite another image.
    [HttpPost]
    [RequestSizeLimit(MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestBytes)]
    [ProducesResponseType<UploadedImageResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Upload(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return FileError("Choose an image to upload.");
        if (file.Length > MaxBytes)
            return FileError("Images can be up to 5 MB.");

        var content = new byte[file.Length];
        await using (var stream = file.OpenReadStream())
            await stream.ReadExactlyAsync(content, ct);

        if (ImageFormats.Detect(content) is not { } format)
            return FileError("Use a JPEG, PNG or WebP image.");

        var key = $"images/{Guid.NewGuid():N}.{format.Extension}";
        await images.PutAsync(key, content, format.ContentType, ct);

        var url = ImageKeys.UrlFor(key);
        return Created(url, new UploadedImageResponse(key, url));
    }

    private IActionResult FileError(string message)
    {
        ModelState.AddModelError("file", message);
        return ValidationProblem(ModelState);
    }
}
