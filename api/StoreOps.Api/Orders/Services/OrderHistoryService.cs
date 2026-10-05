using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails;
using StoreOps.Api.Images;
using StoreOps.Api.Orders.Models;

namespace StoreOps.Api.Orders.Services;

public static class OrderErrors
{
    public static readonly ApiError EmailMismatch = new(StatusCodes.Status409Conflict, "ORDER_EMAIL_MISMATCH",
        "This order was placed with another email address. Sign in with that one to save it to your account.");
}

// Orders as their buyers see them: a customer's own, found by the public order number, and a guest's,
// through the private link in its emails. Another customer's order simply doesn't exist here (404,
// never 403).
public sealed class OrderHistoryService(AppDbContext db, StoreEmails emails)
{
    // Newest first
    public async Task<Paged<OrderSummaryResponse>> ListAsync(int userId, int page, int pageSize, CancellationToken ct)
    {
        var orders = db.Orders.Where(o => o.UserId == userId);
        var totalCount = await orders.CountAsync(ct);
        var items = await orders
            .OrderByDescending(o => o.PlacedAtUtc).ThenByDescending(o => o.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.OrderNumber,
                o.Status,
                o.PlacedAtUtc,
                ItemCount = o.Lines.Sum(l => l.Quantity),
                o.TotalCents,
                FirstImageKey = o.Lines.OrderBy(l => l.ProductId).Select(l => l.ImageKey).FirstOrDefault(),
            })
            .ToListAsync(ct);

        return new Paged<OrderSummaryResponse>(
            items.Select(o => new OrderSummaryResponse(
                o.OrderNumber, o.Status, o.PlacedAtUtc, o.ItemCount, o.TotalCents,
                o.FirstImageKey is null ? null : ImageKeys.UrlFor(o.FirstImageKey))).ToList(),
            page, pageSize, totalCount);
    }

    public async Task<OrderResponse?> GetAsync(int userId, string orderNumber, CancellationToken ct) =>
        await FindAsync(o => o.UserId == userId && o.OrderNumber == orderNumber, ct) is { } order ? ToResponse(order) : null;

    // The page behind a guest's private link
    public async Task<GuestOrderResponse?> GetGuestOrderAsync(string accessToken, CancellationToken ct) =>
        await FindAsync(o => o.AccessToken == accessToken, ct) is { } order
            ? new GuestOrderResponse(order.Email, order.UserId is not null, ToResponse(order))
            : null;

    // "Find your order": emails the order's link to the address it was placed with, when the number and the
    // address match. Nothing is said either way, so the form can't tell anyone who ordered what.
    public async Task SendLinkAsync(string email, string orderNumber, CancellationToken ct)
    {
        var number = orderNumber.Trim().TrimStart('#').ToUpperInvariant();
        var order = await db.Orders.AsNoTracking().SingleOrDefaultAsync(o => o.OrderNumber == number && o.Email == email.Trim(), ct);
        if (order is null)
            return;

        await emails.AddOrderLinkAsync(order, ct);
        await db.SaveChangesAsync(ct);
    }

    // Moves a guest's order into the signed-in account, so it joins their order history. Only an account
    // with the order's email can take it, and only with the private link.
    public async Task<(SavedOrderResponse? Order, ApiError? Error)> SaveToAccountAsync(int userId, string accessToken, CancellationToken ct)
    {
        var order = await db.Orders.SingleOrDefaultAsync(o => o.AccessToken == accessToken, ct);
        if (order is null || (order.UserId is not null && order.UserId != userId))
            return (null, ApiError.NotFound);

        if (order.UserId is null)
        {
            var email = await db.Users.Where(u => u.Id == userId).Select(u => u.Email!).SingleAsync(ct);
            if (!string.Equals(email, order.Email, StringComparison.OrdinalIgnoreCase))
                return (null, OrderErrors.EmailMismatch);

            order.UserId = userId;
            await db.SaveChangesAsync(ct);
        }

        return (new SavedOrderResponse(order.OrderNumber), null);
    }

    private Task<Order?> FindAsync(Expression<Func<Order, bool>> which, CancellationToken ct) =>
        db.Orders
            .AsNoTracking()
            .Include(o => o.Lines)
            .Include(o => o.StatusHistory)
            .AsSplitQuery()
            .SingleOrDefaultAsync(which, ct);

    private static OrderResponse ToResponse(Order order) => new(
        order.OrderNumber,
        order.Status,
        order.PlacedAtUtc,
        order.Lines
            .OrderBy(l => l.ProductId)
            .Select(l => new OrderLineResponse(l.ProductId, l.ProductName, l.UnitPriceCents, l.Quantity, l.LineTotalCents, ImageKeys.UrlFor(l.ImageKey)))
            .ToList(),
        order.SubtotalCents,
        order.ShippingCents,
        order.TaxCents,
        order.TotalCents,
        order.ShipTo,
        order.Carrier,
        order.TrackingNumber,
        Tracking.UrlFor(order.Carrier, order.TrackingNumber),
        order.EstimatedDeliveryDate,
        order.StatusHistory
            .OrderBy(s => s.ChangedAtUtc).ThenBy(s => s.Id)
            .Select(s => new OrderStepResponse(s.Status, s.ChangedAtUtc, s.Note))
            .ToList());
}
