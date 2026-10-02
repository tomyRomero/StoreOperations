using System.ComponentModel.DataAnnotations;

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
