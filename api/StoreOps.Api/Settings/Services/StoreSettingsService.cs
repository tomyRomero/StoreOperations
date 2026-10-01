using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
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
}

// The store's policies: one row the owner edits in the admin, read by checkout, emails and the storefront
public sealed class StoreSettingsService(AppDbContext db, TimeProvider clock)
{
    public async Task<PublicStoreSettingsResponse> GetPublicAsync(CancellationToken ct) =>
        await db.StoreSettings
            .Select(s => new PublicStoreSettingsResponse(
                s.StoreName, s.SupportEmail, s.ShippingFlatRateCents, s.FreeShippingThresholdCents,
                s.ReturnPolicy, s.ReturnWindowDays, s.ReturnPolicyNote, s.LowStockThreshold, s.TimeZoneId))
            .SingleAsync(ct);

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

        var settings = await db.StoreSettings.SingleAsync(ct);
        if (!settings.RowVersion.AsSpan().SequenceEqual(request.RowVersion))
            return (null, SettingsErrors.EditConflict);
        // Checked again by the save, in case another admin saves in between
        db.Entry(settings).Property(s => s.RowVersion).OriginalValue = request.RowVersion;

        settings.StoreName = request.StoreName.Trim();
        settings.SupportEmail = Blank(request.SupportEmail);
        settings.ShippingFlatRateCents = request.ShippingFlatRateCents;
        settings.FreeShippingThresholdCents = request.FreeShippingThresholdCents;
        settings.ReturnPolicy = request.ReturnPolicy;
        settings.ReturnWindowDays = request.ReturnPolicy == ReturnPolicy.NoReturns ? null : request.ReturnWindowDays;
        settings.ReturnPolicyNote = Blank(request.ReturnPolicyNote);
        settings.LowStockThreshold = request.LowStockThreshold;
        settings.EmailCustomerOnStatusUpdateByDefault = request.EmailCustomerOnStatusUpdateByDefault;
        settings.TimeZoneId = request.TimeZoneId;

        var changes = db.Entry(settings).Properties
            .Where(p => p.IsModified)
            .ToDictionary(
                p => JsonNamingPolicy.CamelCase.ConvertName(p.Metadata.Name),
                p => new { from = p.OriginalValue, to = p.CurrentValue });
        if (changes.Count == 0)
            return (ToResponse(settings), null);

        db.ActivityLog.Add(Activity.Entry(
            ActivityAction.SettingsChanged, ActivityEntity.StoreSettings, settings.Id, adminId, new { changes }, clock));

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return (null, SettingsErrors.EditConflict);
        }

        return (ToResponse(settings), null);
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static StoreSettingsResponse ToResponse(StoreSettings s) => new(
        s.StoreName, s.SupportEmail, s.ShippingFlatRateCents, s.FreeShippingThresholdCents, s.ReturnPolicy,
        s.ReturnWindowDays, s.ReturnPolicyNote, s.LowStockThreshold, s.EmailCustomerOnStatusUpdateByDefault,
        s.TimeZoneId, s.UpdatedAtUtc, s.RowVersion);
}
