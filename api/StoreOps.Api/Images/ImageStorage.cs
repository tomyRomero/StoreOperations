using System.Net;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Images;

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
