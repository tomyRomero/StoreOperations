using System.Globalization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Account.Services;
using StoreOps.Api.Common;
using StoreOps.Api.Customers.Models;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Orders.Models;
using StoreOps.Api.Orders.Services;

namespace StoreOps.Api.Customers.Services;

public static class CustomerErrors
{
    public static readonly ApiError AdminAccount = new(StatusCodes.Status409Conflict, "ADMIN_ACCOUNT",
        "Admin accounts can't be disabled here. Remove the admin role on the server first.");

    public static readonly ApiError AccountChanged = new(StatusCodes.Status409Conflict, "ACCOUNT_CHANGED",
        "This account changed at the same moment. Reload it and try again.");
}

// Accounts as the admin sees them, and disabling one. A disabled account can't sign in, and its open
// sessions end at their next check against the database (within a minute).
public sealed class AdminCustomerService(
    AppDbContext db,
    UserManager<ApplicationUser> users,
    AddressService addresses,
    AdminOrderService orders,
    TimeProvider clock)
{
    public const int RecentOrderCount = 5;

    private static readonly string AdminRoleName = Roles.Admin.ToUpperInvariant();

    // Newest first. Search matches the username or email, or the account's id.
    public async Task<Paged<AdminCustomerSummaryResponse>> ListAsync(AdminCustomerQuery query, CancellationToken ct)
    {
        var now = clock.GetUtcNow();
        var adminIds = AdminIds();

        var accounts = db.Users.AsQueryable();
        if (query.Role is { } role)
            accounts = role == AccountRole.Admin
                ? accounts.Where(u => adminIds.Contains(u.Id))
                : accounts.Where(u => !adminIds.Contains(u.Id));
        if (query.Search?.Trim() is { Length: > 0 } search)
        {
            int? id = int.TryParse(search, NumberStyles.None, CultureInfo.InvariantCulture, out var number) ? number : null;
            accounts = accounts.Where(u => u.Id == id || u.UserName!.Contains(search) || u.Email!.Contains(search));
        }

        var totalCount = await accounts.CountAsync(ct);
        // The id breaks ties, so an account never shows up on two pages
        var sorted = query.Sort switch
        {
            AdminCustomerSort.Joined => accounts.OrderBy(u => u.CreatedAtUtc).ThenBy(u => u.Id),
            AdminCustomerSort.Username => accounts.OrderBy(u => u.UserName).ThenBy(u => u.Id),
            AdminCustomerSort.UsernameDesc => accounts.OrderByDescending(u => u.UserName).ThenBy(u => u.Id),
            _ => accounts.OrderByDescending(u => u.CreatedAtUtc).ThenByDescending(u => u.Id),
        };
        var items = await sorted
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new AdminCustomerSummaryResponse(
                u.Id,
                u.UserName!,
                u.Email!,
                u.CreatedAtUtc,
                adminIds.Contains(u.Id),
                u.LockoutEnabled && u.LockoutEnd > now,
                db.Orders.Count(o => o.UserId == u.Id)))
            .ToListAsync(ct);

        return new Paged<AdminCustomerSummaryResponse>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<AdminCustomerResponse?> GetAsync(int id, CancellationToken ct)
    {
        var now = clock.GetUtcNow();
        var adminIds = AdminIds();

        var account = await db.Users
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.CreatedAtUtc,
                IsAdmin = adminIds.Contains(u.Id),
                IsDisabled = u.LockoutEnabled && u.LockoutEnd > now,
                SpentCents = db.Orders
                    .Where(o => o.UserId == u.Id && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                    .Sum(o => o.TotalCents),
            })
            .SingleOrDefaultAsync(ct);
        if (account is null)
            return null;

        var recent = await orders.ListAsync(new AdminOrderQuery(null, null, id, AdminOrderSort.PlacedDesc, 1, RecentOrderCount), ct);

        return new AdminCustomerResponse(
            account.Id,
            account.UserName!,
            account.Email!,
            account.CreatedAtUtc,
            account.IsAdmin,
            account.IsDisabled,
            recent.TotalCount,
            account.SpentCents,
            await addresses.ListAsync(id, ct),
            recent.Items);
    }

    // Admin accounts can't be disabled from the dashboard (not even your own), so one admin can't lock
    // the others out. Disabling an account that already is changes nothing.
    public async Task<(AdminCustomerResponse? Customer, ApiError? Error)> DisableAsync(int id, int adminId, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(id.ToString(CultureInfo.InvariantCulture));
        if (user is null)
            return (null, ApiError.NotFound);
        if (await users.IsInRoleAsync(user, Roles.Admin))
            return (null, CustomerErrors.AdminAccount);

        if (!await users.IsLockedOutAsync(user))
        {
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.MaxValue;
            db.ActivityLog.Add(Activity.Entry(ActivityAction.CustomerDisabled, ActivityEntity.User, id, adminId, new { username = user.UserName }, clock));

            // A new security stamp is what ends the account's open sessions. Identity saves the user
            // through this same database context, so the lockout, the stamp and the activity entry
            // are saved together.
            if (!(await users.UpdateSecurityStampAsync(user)).Succeeded)
                return (null, CustomerErrors.AccountChanged);
        }

        return (await GetAsync(id, ct), null);
    }

    public async Task<(AdminCustomerResponse? Customer, ApiError? Error)> EnableAsync(int id, int adminId, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(id.ToString(CultureInfo.InvariantCulture));
        if (user is null)
            return (null, ApiError.NotFound);

        if (await users.IsLockedOutAsync(user))
        {
            user.LockoutEnd = null;
            db.ActivityLog.Add(Activity.Entry(ActivityAction.CustomerEnabled, ActivityEntity.User, id, adminId, new { username = user.UserName }, clock));

            // Saves the user and the activity entry together, as above
            if (!(await users.UpdateAsync(user)).Succeeded)
                return (null, CustomerErrors.AccountChanged);
        }

        return (await GetAsync(id, ct), null);
    }

    // The ids of admin accounts, as a subquery EF folds into the query that uses it
    private IQueryable<int> AdminIds() =>
        from userRole in db.UserRoles
        join role in db.Roles on userRole.RoleId equals role.Id
        where role.NormalizedName == AdminRoleName
        select userRole.UserId;
}
