namespace StoreOps.Api.Images;

public sealed record ImageFormat(string Extension, string ContentType);

public static class ImageFormats
{
    private static ReadOnlySpan<byte> JpegStart => [0xFF, 0xD8, 0xFF];
    private static ReadOnlySpan<byte> PngStart => [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    // Recognizes a file by its first bytes, never by its name or the type the browser claimed
    public static ImageFormat? Detect(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith(JpegStart))
            return new ImageFormat("jpg", "image/jpeg");

        if (bytes.StartsWith(PngStart))
            return new ImageFormat("png", "image/png");

        // "RIFF", four bytes of length, then "WEBP"
        if (bytes.Length >= 12 && bytes[..4].SequenceEqual("RIFF"u8) && bytes[8..12].SequenceEqual("WEBP"u8))
            return new ImageFormat("webp", "image/webp");

        return null;
    }
}
