using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Account.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Account.Services;

public static class AddressErrors
{
    public static readonly ApiError BookFull = new(StatusCodes.Status409Conflict, "ADDRESS_BOOK_FULL",
        $"You can save up to {AddressService.MaxAddresses} addresses. Delete one to add another.");

    public static readonly ApiError BookChanged = new(StatusCodes.Status409Conflict, "ADDRESS_BOOK_CHANGED",
        "Your address book changed in another tab. Reload it and try again.");
}

// A customer's own address book. Every query is limited to the signed-in customer, so another
// customer's address simply doesn't exist here (404, never 403).
public sealed class AddressService(AppDbContext db)
{
    public const int MaxAddresses = 20;

    private static readonly Expression<Func<UserAddress, AddressResponse>> ToResponse = a => new AddressResponse(
        a.Id, a.Address.RecipientName, a.Address.Line1, a.Address.Line2, a.Address.City, a.Address.State,
        a.Address.PostalCode, a.Address.CountryCode, a.IsDefault);

    // The default first, then the newest
    public async Task<IReadOnlyList<AddressResponse>> ListAsync(int userId, CancellationToken ct) =>
        await db.UserAddresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault).ThenByDescending(a => a.Id)
            .Select(ToResponse)
            .ToListAsync(ct);

    public async Task<AddressResponse?> GetAsync(int userId, int id, CancellationToken ct) =>
        await db.UserAddresses.Where(a => a.UserId == userId && a.Id == id).Select(ToResponse).SingleOrDefaultAsync(ct);

    public async Task<(AddressResponse? Address, ApiError? Error)> AddAsync(
        int userId, NewAddressRequest request, CancellationToken ct)
    {
        var count = await db.UserAddresses.CountAsync(a => a.UserId == userId, ct);
        if (count >= MaxAddresses)
            return (null, AddressErrors.BookFull);

        var makeDefault = request.IsDefault || count == 0;
        int id;
        try
        {
            id = await db.InTransactionAsync(async () =>
            {
                if (makeDefault)
                    await db.UserAddresses
                        .Where(a => a.UserId == userId && a.IsDefault)
                        .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false), ct);

                var address = new UserAddress { UserId = userId, Address = request.ToPostalAddress(), IsDefault = makeDefault };
                db.UserAddresses.Add(address);
                await db.SaveChangesAsync(ct);
                return address.Id;
            }, ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            // Another default was saved at the same moment; the database allows only one
            return (null, AddressErrors.BookChanged);
        }

        return (await GetAsync(userId, id, ct), null);
    }

    public async Task<AddressResponse?> UpdateAsync(int userId, int id, AddressRequest request, CancellationToken ct)
    {
        var address = await db.UserAddresses.SingleOrDefaultAsync(a => a.UserId == userId && a.Id == id, ct);
        if (address is null)
            return null;

        // An address is a value: placed orders keep their own copy, so editing it changes no order
        address.Address = request.ToPostalAddress();
        await db.SaveChangesAsync(ct);
        return await GetAsync(userId, id, ct);
    }

    // One statement flips every flag at once, so there is never a moment with two defaults
    public async Task<IReadOnlyList<AddressResponse>?> SetDefaultAsync(int userId, int id, CancellationToken ct)
    {
        if (!await db.UserAddresses.AnyAsync(a => a.UserId == userId && a.Id == id, ct))
            return null;

        await db.UserAddresses
            .Where(a => a.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, a => a.Id == id), ct);
        return await ListAsync(userId, ct);
    }

    // Deleting the default makes the newest remaining address the default
    public async Task<bool> DeleteAsync(int userId, int id, CancellationToken ct)
    {
        var address = await db.UserAddresses.SingleOrDefaultAsync(a => a.UserId == userId && a.Id == id, ct);
        if (address is null)
            return false;

        await db.InTransactionAsync(async () =>
        {
            await db.UserAddresses.Where(a => a.Id == id).ExecuteDeleteAsync(ct);
            if (address.IsDefault)
            {
                var newest = await db.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.Id)
                    .Select(a => (int?)a.Id)
                    .FirstOrDefaultAsync(ct);
                if (newest is not null)
                    await db.UserAddresses
                        .Where(a => a.Id == newest)
                        .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, true), ct);
            }
            return true;
        }, ct);

        return true;
    }
}
