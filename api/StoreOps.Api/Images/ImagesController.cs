using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StoreOps.Api.Images;

[ApiController]
[Route("api/images")]
[AllowAnonymous]
public sealed class ImagesController(ImageStorage images) : ControllerBase
{
    // A key never points at different content (a new image gets a new key), so browsers and
    // Next's image optimizer may cache it for a year without checking back.
    [HttpGet("{**key}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string key, CancellationToken ct)
    {
        if (!ImageKeys.IsValid(key))
            return NotFound();

        var image = await images.GetAsync(key, ct);
        if (image is null)
            return NotFound();

        Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        // Browsers must trust the declared image type and never guess another (such as HTML)
        Response.Headers.XContentTypeOptions = "nosniff";
        return File(image.Content, image.ContentType);
    }
}
