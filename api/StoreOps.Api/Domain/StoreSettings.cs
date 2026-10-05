namespace StoreOps.Api.Domain;

// The store's policies and its storefront (name, look, home page and page text), edited in the console
// instead of written into code. Exactly one row (Id = 1), created by the first migration.
public class StoreSettings : IUpdatedAt
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public required string StoreName { get; set; }
    public string? SupportEmail { get; set; }

    public int ShippingFlatRateCents { get; set; }
    // Null means free shipping is off
    public int? FreeShippingThresholdCents { get; set; }

    public ReturnPolicy ReturnPolicy { get; set; }
    // Required unless the policy is NoReturns
    public short? ReturnWindowDays { get; set; }
    public string? ReturnPolicyNote { get; set; }

    public int LowStockThreshold { get; set; }
    public bool EmailCustomerOnStatusUpdateByDefault { get; set; }

    // Shoppers can check out without an account. When it's off, they sign in or create one first.
    public bool GuestCheckout { get; set; } = true;

    // IANA time zone (e.g. America/New_York): decides what "a day" means on the dashboard and order pages
    public required string TimeZoneId { get; set; }

    // The storefront, from Theme and brand in the console. Empty text falls back to wording built from
    // the store's name, so a new store reads well before it's filled in.
    public StorefrontTheme Theme { get; set; }
    public string? Tagline { get; set; }
    // The search-engine description, and the lead on the About page
    public string? Description { get; set; }
    public string? LogoImageKey { get; set; }
    // "#RRGGBB". Null keeps the theme's own accent.
    public string? AccentColor { get; set; }
    // What the store calls what it sells, in "12 supplies" and "Shop all supplies"
    public string ProductNoun { get; set; } = "product";
    public string ProductNounPlural { get; set; } = "products";

    public string? HeroHeadline { get; set; }
    // A second headline line, set in the brand gradient
    public string? HeroHighlight { get; set; }
    public string? HeroText { get; set; }
    public string? HeroButtonLabel { get; set; }
    // The rows under the hero, in order. A row that's left out is hidden.
    public List<HomeSection> HomeSections { get; set; } = [.. DefaultHomeSections];

    // Paragraphs separated by blank lines
    public string? AboutText { get; set; }
    public string? ContactPhone { get; set; }
    // Lines separated by line breaks
    public string? ContactAddress { get; set; }
    public string? InstagramUrl { get; set; }
    public string? TikTokUrl { get; set; }
    public string? PinterestUrl { get; set; }
    public string? YouTubeUrl { get; set; }
    public string? FacebookUrl { get; set; }

    public static readonly HomeSection[] DefaultHomeSections = [HomeSection.Categories, HomeSection.NewIn, HomeSection.Newsletter];

    public DateTime UpdatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public enum ReturnPolicy
{
    NoReturns,
    Exchanges,
    Refunds,
}

// Built-in storefront looks. Each is a set of design tokens; the pages and components are shared.
public enum StorefrontTheme
{
    NightStudio,
    Atelier,
}

public enum HomeSection
{
    Categories,
    Deals,
    NewIn,
    Newsletter,
}
