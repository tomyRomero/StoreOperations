namespace StoreOps.Api.Common;

public sealed class SiteOptions
{
    // The storefront's address, for links in emails. Production sets Site__PublicUrl.
    public string PublicUrl { get; set; } = "http://localhost:3200";
}
