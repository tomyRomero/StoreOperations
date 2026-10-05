using System.Text.RegularExpressions;

namespace StoreOps.Api.Images;

// Image keys are always made by the API, so anything that doesn't look like one is refused
// without asking storage.
public static partial class ImageKeys
{
    public static bool IsValid(string? key) => key is { Length: <= 300 } && Pattern().IsMatch(key);

    public static string UrlFor(string key) => $"/api/images/{key}";

    // "images/3f2a...c1.webp" for uploads; "seed/products/oilpaint.jpg" for the demo data
    [GeneratedRegex("^(images|seed)/[a-z0-9/_-]+\\.(jpg|png|webp)$")]
    private static partial Regex Pattern();
}
