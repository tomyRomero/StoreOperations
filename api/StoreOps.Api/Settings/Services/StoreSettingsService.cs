using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;
using StoreOps.Api.Settings.Models;

namespace StoreOps.Api.Settings.Services;

public static class SettingsErrors
{
    public static readonly ApiError ReturnWindowRequired = new(StatusCodes.Status400BadRequest, "RETURN_WINDOW_REQUIRED",
        "Enter how many days customers have to return an item.", Field: "returnWindowDays");

    public static readonly ApiError UnknownTimeZone = new(StatusCodes.Status400BadRequest, "UNKNOWN_TIME_ZONE",
        "Choose a time zone from the list, such as America/New_York.", Field: "timeZoneId");

    public static readonly ApiError EditConflict = new(StatusCodes.Status409Conflict, "EDIT_CONFLICT",
        "The settings changed after you opened them. Reload to see the latest version, then make your change again.");

    public static readonly ApiError LogoNotUploaded = new(StatusCodes.Status400BadRequest, "IMAGE_NOT_UPLOADED",
        "Upload the logo first.", Field: "logoImageKey");

    public static readonly ApiError HomeSectionRepeated = new(StatusCodes.Status400BadRequest, "HOME_SECTION_REPEATED",
        "Each row can appear on the home page once.", Field: "homeSections");

    public static ApiError LinkNotHttps(string field) => new(StatusCodes.Status400BadRequest, "LINK_NOT_HTTPS",
        "Use the full address of the page, starting with https://", Field: field);
}

// The store's policies and storefront: one row the owner edits in the console (Store settings, and Theme
// and brand), read by checkout, emails and the storefront
public sealed class StoreSettingsService(AppDbContext db, ImageStorage images, TimeProvider clock)
{
    public async Task<PublicStoreSettingsResponse> GetPublicAsync(CancellationToken ct)
    {
        var s = await db.StoreSettings.AsNoTracking().SingleAsync(ct);
        return new PublicStoreSettingsResponse(
            s.StoreName, s.SupportEmail, s.ShippingFlatRateCents, s.FreeShippingThresholdCents,
            s.ReturnPolicy, s.ReturnWindowDays, s.ReturnPolicyNote, s.LowStockThreshold, s.TimeZoneId, s.GuestCheckout, ToStorefront(s));
    }

    public async Task<StorefrontSettingsResponse> GetStorefrontAsync(CancellationToken ct) =>
        ToStorefrontSettings(await db.StoreSettings.AsNoTracking().SingleAsync(ct));

    public async Task<StoreSettingsResponse> GetAsync(CancellationToken ct) =>
        ToResponse(await db.StoreSettings.AsNoTracking().SingleAsync(ct));

    // Saves the whole form. The activity entry lists each setting that changed, from and to.
    public async Task<(StoreSettingsResponse? Settings, ApiError? Error)> UpdateAsync(
        UpdateStoreSettingsRequest request, int adminId, CancellationToken ct)
    {
        if (request.ReturnPolicy != ReturnPolicy.NoReturns && request.ReturnWindowDays is null)
            return (null, SettingsErrors.ReturnWindowRequired);
        if (!TimeZoneInfo.TryFindSystemTimeZoneById(request.TimeZoneId, out var zone) || !zone.HasIanaId)
            return (null, SettingsErrors.UnknownTimeZone);

        if (await LoadForEditAsync(request.RowVersion, ct) is not { } settings)
            return (null, SettingsErrors.EditConflict);

        settings.SupportEmail = Blank(request.SupportEmail);
        settings.ShippingFlatRateCents = request.ShippingFlatRateCents;
        settings.FreeShippingThresholdCents = request.FreeShippingThresholdCents;
        settings.ReturnPolicy = request.ReturnPolicy;
        settings.ReturnWindowDays = request.ReturnPolicy == ReturnPolicy.NoReturns ? null : request.ReturnWindowDays;
        settings.ReturnPolicyNote = Blank(request.ReturnPolicyNote);
        settings.LowStockThreshold = request.LowStockThreshold;
        settings.EmailCustomerOnStatusUpdateByDefault = request.EmailCustomerOnStatusUpdateByDefault;
        settings.TimeZoneId = request.TimeZoneId;
        settings.GuestCheckout = request.GuestCheckout;

        return await SaveAsync(settings, adminId, ct) ? (ToResponse(settings), null) : (null, SettingsErrors.EditConflict);
    }

    // Publishes the Theme and brand form to the store
    public async Task<(StorefrontSettingsResponse? Settings, ApiError? Error)> UpdateStorefrontAsync(
        UpdateStorefrontRequest request, int adminId, CancellationToken ct)
    {
        if (request.HomeSections.Distinct().Count() != request.HomeSections.Count)
            return (null, SettingsErrors.HomeSectionRepeated);

        var links = new (string Field, string? Url)[]
        {
            ("instagramUrl", request.InstagramUrl), ("tikTokUrl", request.TikTokUrl), ("pinterestUrl", request.PinterestUrl),
            ("youTubeUrl", request.YouTubeUrl), ("facebookUrl", request.FacebookUrl),
        };
        foreach (var (field, url) in links)
            if (Blank(url) is { } link && !(Uri.TryCreate(link, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps))
                return (null, SettingsErrors.LinkNotHttps(field));

        if (await LoadForEditAsync(request.RowVersion, ct) is not { } settings)
            return (null, SettingsErrors.EditConflict);

        // Only a new logo needs checking; the current one is already in use
        var logo = Blank(request.LogoImageKey);
        if (logo is not null && logo != settings.LogoImageKey && !(ImageKeys.IsValid(logo) && await images.ExistsAsync(logo, ct)))
            return (null, SettingsErrors.LogoNotUploaded);

        settings.StoreName = request.StoreName.Trim();
        settings.Theme = request.Theme;
        settings.Tagline = Blank(request.Tagline);
        settings.Description = Blank(request.Description);
        settings.LogoImageKey = logo;
        settings.AccentColor = Blank(request.AccentColor)?.ToUpperInvariant();
        settings.ProductNoun = request.ProductNoun.Trim();
        settings.ProductNounPlural = request.ProductNounPlural.Trim();
        settings.HeroHeadline = Blank(request.HeroHeadline);
        settings.HeroHighlight = Blank(request.HeroHighlight);
        settings.HeroText = Blank(request.HeroText);
        settings.HeroButtonLabel = Blank(request.HeroButtonLabel);
        settings.HomeSections = [.. request.HomeSections];
        settings.AboutText = Blank(request.AboutText);
        settings.ContactPhone = Blank(request.ContactPhone);
        settings.ContactAddress = Blank(request.ContactAddress);
        settings.InstagramUrl = Blank(request.InstagramUrl);
        settings.TikTokUrl = Blank(request.TikTokUrl);
        settings.PinterestUrl = Blank(request.PinterestUrl);
        settings.YouTubeUrl = Blank(request.YouTubeUrl);
        settings.FacebookUrl = Blank(request.FacebookUrl);

        return await SaveAsync(settings, adminId, ct) ? (ToStorefrontSettings(settings), null) : (null, SettingsErrors.EditConflict);
    }

    // Null when another admin saved since this form was opened
    private async Task<StoreSettings?> LoadForEditAsync(byte[] rowVersion, CancellationToken ct)
    {
        var settings = await db.StoreSettings.SingleAsync(ct);
        if (!settings.RowVersion.AsSpan().SequenceEqual(rowVersion))
            return null;
        // Checked again by the save, in case another admin saves in between
        db.Entry(settings).Property(s => s.RowVersion).OriginalValue = rowVersion;
        return settings;
    }

    // Saves what changed, with an activity entry listing each setting from and to. False on an edit conflict.
    private async Task<bool> SaveAsync(StoreSettings settings, int adminId, CancellationToken ct)
    {
        var changes = db.Entry(settings).Properties
            .Where(p => p.IsModified)
            .ToDictionary(
                p => JsonNamingPolicy.CamelCase.ConvertName(p.Metadata.Name),
                p => new { from = p.OriginalValue, to = p.CurrentValue });
        if (changes.Count == 0)
            return true;

        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.SettingsChanged, ActivityEntity.StoreSettings, settings.Id, adminId, new { changes }, clock));

        try
        {
            await db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static StorefrontResponse ToStorefront(StoreSettings s) => new(
        s.Theme, s.Tagline, s.Description, s.LogoImageKey is null ? null : ImageKeys.UrlFor(s.LogoImageKey), s.AccentColor,
        s.ProductNoun, s.ProductNounPlural, s.HeroHeadline, s.HeroHighlight, s.HeroText, s.HeroButtonLabel, s.HomeSections,
        s.AboutText, s.ContactPhone, s.ContactAddress,
        new SocialLinks(s.InstagramUrl, s.TikTokUrl, s.PinterestUrl, s.YouTubeUrl, s.FacebookUrl));

    private static StorefrontSettingsResponse ToStorefrontSettings(StoreSettings s) =>
        new(s.StoreName, s.LogoImageKey, ToStorefront(s), s.UpdatedAtUtc, s.RowVersion);

    private static StoreSettingsResponse ToResponse(StoreSettings s) => new(
        s.SupportEmail, s.ShippingFlatRateCents, s.FreeShippingThresholdCents, s.ReturnPolicy,
        s.ReturnWindowDays, s.ReturnPolicyNote, s.LowStockThreshold, s.EmailCustomerOnStatusUpdateByDefault,
        s.TimeZoneId, s.GuestCheckout, s.UpdatedAtUtc, s.RowVersion);
}
