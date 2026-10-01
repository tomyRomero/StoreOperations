using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.RegularExpressions;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Images;

// Where images are kept. Any S3-compatible service works: AWS S3, Cloudflare R2, Backblaze B2,
// or S3Mock locally. Only the settings change.
public sealed class StorageOptions
{
    // Empty for AWS S3. Otherwise the service's endpoint, e.g. http://localhost:9090 for S3Mock.
    public string? ServiceUrl { get; set; }

    public string Region { get; set; } = "us-east-1";

    [Required]
    public string Bucket { get; set; } = "";

    // Empty on AWS to use the server's IAM role instead of keys
    public string? AccessKey { get; set; }
    public string? SecretKey { get; set; }

    // The bucket goes in the path (host/bucket/key) instead of the host name. S3Mock and MinIO need this.
    public bool ForcePathStyle { get; set; }
}

public sealed record StoredImage(Stream Content, string ContentType);

// The bucket is private. Images reach browsers only through GET /api/images/{key}.
public sealed class ImageStorage(IAmazonS3 s3, IOptions<StorageOptions> options)
{
    private string Bucket => options.Value.Bucket;

    public async Task PutAsync(string key, byte[] content, string contentType, CancellationToken ct)
    {
        using var body = new MemoryStream(content);
        await s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = Bucket,
            Key = key,
            InputStream = body,
            ContentType = contentType,
            // Sign the whole body at once instead of in chunks. R2 rejects chunked signing, and the
            // image is already in memory, so hashing it up front costs nothing.
            UseChunkEncoding = false,
        }, ct);
    }

    // Null when there is no image with that key. The caller disposes the stream.
    public async Task<StoredImage?> GetAsync(string key, CancellationToken ct)
    {
        try
        {
            var response = await s3.GetObjectAsync(Bucket, key, ct);
            return new StoredImage(response.ResponseStream, response.Headers.ContentType);
        }
        catch (AmazonS3Exception error) when (error.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct)
    {
        try
        {
            await s3.GetObjectMetadataAsync(Bucket, key, ct);
            return true;
        }
        catch (AmazonS3Exception error) when (error.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}

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

public static class ImageServiceCollectionExtensions
{
    public static IServiceCollection AddImageStorage(this IServiceCollection services)
    {
        services.AddOptions<StorageOptions>().BindConfiguration("Storage").ValidateDataAnnotations().ValidateOnStart();

        services.AddSingleton<IAmazonS3>(provider =>
        {
            var storage = provider.GetRequiredService<IOptions<StorageOptions>>().Value;
            var config = new AmazonS3Config
            {
                ForcePathStyle = storage.ForcePathStyle,
                // Checksums only where S3 requires them. Some S3-compatible services reject the SDK's newer defaults.
                RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
                ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED,
            };
            if (string.IsNullOrEmpty(storage.ServiceUrl))
            {
                config.RegionEndpoint = RegionEndpoint.GetBySystemName(storage.Region);
            }
            else
            {
                config.ServiceURL = storage.ServiceUrl;
                config.AuthenticationRegion = storage.Region;
            }

            return string.IsNullOrEmpty(storage.AccessKey)
                ? new AmazonS3Client(config)
                : new AmazonS3Client(new BasicAWSCredentials(storage.AccessKey, storage.SecretKey), config);
        });

        services.AddSingleton<ImageStorage>();
        return services;
    }
}
