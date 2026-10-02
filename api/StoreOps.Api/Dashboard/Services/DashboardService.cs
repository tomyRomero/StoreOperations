using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Dashboard.Models;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Dashboard.Services;

// The admin's landing page: how the store did over the last N days, compared with the N days before.
// "A day" is a day in the store's time zone, so an order at 11 pm in New York counts for that day, not
// the next one in UTC.
public sealed class DashboardService(AppDbContext db, TimeProvider clock)
{
    public const int TopProductCount = 5;
    public const int LowStockListCount = 10;

    private static readonly OrderStatus[] NotCounted = [OrderStatus.Cancelled, OrderStatus.Refunded];

    public async Task<DashboardResponse> GetAsync(int days, CancellationToken ct)
    {
        var settings = await db.StoreSettings.AsNoTracking().SingleAsync(ct);
        var zone = TimeZoneInfo.FindSystemTimeZoneById(settings.TimeZoneId);

        var nowUtc = clock.GetUtcNow().UtcDateTime;
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(nowUtc, zone));
        var first = today.AddDays(1 - days);
        var fromUtc = StartOfDayUtc(first, zone);
        var previousFromUtc = StartOfDayUtc(first.AddDays(-days), zone);

        // Both periods' orders, small enough to count here; grouping by the store's days needs the
        // time zone conversion, which SQL Server can't do with IANA time zones
        var orders = await db.Orders
            .Where(o => o.PlacedAtUtc >= previousFromUtc && o.PlacedAtUtc <= nowUtc)
            .Select(o => new { o.PlacedAtUtc, o.Status, o.SubtotalCents })
            .ToListAsync(ct);
        var current = orders.Where(o => o.PlacedAtUtc >= fromUtc).ToList();
        var previous = orders.Where(o => o.PlacedAtUtc < fromUtc).ToList();
        var countedNow = current.Where(o => !NotCounted.Contains(o.Status)).ToList();
        var countedBefore = previous.Where(o => !NotCounted.Contains(o.Status)).ToList();

        var revenue = new Comparison(countedNow.Sum(o => o.SubtotalCents), countedBefore.Sum(o => o.SubtotalCents));
        var orderCount = new Comparison(countedNow.Count, countedBefore.Count);

        var revenueByDay = countedNow
            .GroupBy(o => DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(o.PlacedAtUtc, zone)))
            .ToDictionary(g => g.Key, g => (Revenue: g.Sum(o => o.SubtotalCents), Orders: g.Count()));

        var lowStock = db.Products.Where(p => p.ArchivedAtUtc == null && p.Stock <= settings.LowStockThreshold);

        var kpis = new DashboardKpis(
            revenue,
            orderCount,
            new Comparison(Average(revenue.Value, orderCount.Value), Average(revenue.Previous, orderCount.Previous)),
            new Comparison(
                await NewCustomersAsync(fromUtc, nowUtc, ct),
                await NewCustomersAsync(previousFromUtc, fromUtc, ct)),
            await db.Orders.CountAsync(o => o.Status == OrderStatus.Pending, ct),
            await lowStock.CountAsync(ct));

        return new DashboardResponse(
            first,
            today,
            settings.TimeZoneId,
            kpis,
            Enumerable.Range(0, days)
                .Select(i => first.AddDays(i))
                .Select(day => revenueByDay.TryGetValue(day, out var sums)
                    ? new DailyRevenue(day, sums.Revenue, sums.Orders)
                    : new DailyRevenue(day, 0, 0))
                .ToList(),
            current
                .GroupBy(o => o.Status)
                .Select(g => new StatusCount(g.Key, g.Count()))
                .OrderBy(s => s.Status)
                .ToList(),
            await db.Orders
                .Where(o => o.PlacedAtUtc >= fromUtc && o.PlacedAtUtc <= nowUtc && !NotCounted.Contains(o.Status))
                .SelectMany(o => o.Lines)
                .GroupBy(l => new { l.ProductId, l.ProductName })
                .Select(g => new { g.Key.ProductId, g.Key.ProductName, Quantity = g.Sum(l => l.Quantity), Revenue = g.Sum(l => l.LineTotalCents) })
                .OrderByDescending(p => p.Quantity).ThenByDescending(p => p.Revenue)
                .Take(TopProductCount)
                .Select(p => new TopProduct(p.ProductId, p.ProductName, p.Quantity, p.Revenue))
                .ToListAsync(ct),
            await lowStock
                .OrderBy(p => p.Stock).ThenBy(p => p.Name)
                .Take(LowStockListCount)
                .Select(p => new LowStockProduct(p.Id, p.Name, p.Stock))
                .ToListAsync(ct));
    }

    // Accounts made in the period, not counting admins
    private Task<int> NewCustomersAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct)
    {
        var adminIds = db.AdminUserIds();
        return db.Users.CountAsync(u => u.CreatedAtUtc >= fromUtc && u.CreatedAtUtc < toUtc && !adminIds.Contains(u.Id), ct);
    }

    private static int Average(int totalCents, int count) => count == 0 ? 0 : (int)Math.Round((double)totalCents / count);

    // Midnight in the store's time zone, as UTC. Where the clocks jump forward at midnight that
    // midnight doesn't exist, and the day starts at the first minute that does.
    private static DateTime StartOfDayUtc(DateOnly day, TimeZoneInfo zone)
    {
        var start = day.ToDateTime(TimeOnly.MinValue);
        while (zone.IsInvalidTime(start))
            start = start.AddMinutes(1);
        return TimeZoneInfo.ConvertTimeToUtc(start, zone);
    }
}
