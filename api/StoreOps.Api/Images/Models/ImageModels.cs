namespace StoreOps.Api.Images.Models;

// Save Key on the product or category; Url is where the image is served from
public sealed record UploadedImageResponse(string Key, string Url);
