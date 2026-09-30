using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Images;
using StoreOps.Api.Orders.Models;

namespace StoreOps.Api.Orders.Services;

// A customer's own orders, found by the public order number. Another customer's order simply
// doesn't exist here (404, never 403).
public sealed class OrderHistoryService(AppDbContext db)
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

    public async Task<OrderResponse?> GetAsync(int userId, string orderNumber, CancellationToken ct)
    {
        var order = await db.Orders
            .AsNoTracking()
            .Include(o => o.Lines)
            .Include(o => o.StatusHistory)
            .AsSplitQuery()
            .SingleOrDefaultAsync(o => o.UserId == userId && o.OrderNumber == orderNumber, ct);
        if (order is null)
            return null;

        return new OrderResponse(
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
}
