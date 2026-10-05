using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.Extensions.Options;

namespace StoreOps.Api.Images;

public static class ImagesServiceCollectionExtensions
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
