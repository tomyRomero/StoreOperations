using StoreOps.Api.Domain;

namespace StoreOps.Api.Dashboard.Models;

// A number for the chosen period and for the same length of time just before it, so the page can
// show the change. The page works out the percentage (and what to say when the previous one is 0).
public sealed record Comparison(int Value, int Previous);

// Revenue is the item subtotal of orders that weren't cancelled or refunded; Orders counts those same
// orders, so AverageOrderCents is Revenue / Orders. ToShip (pending orders) and LowStock are right now.
public sealed record DashboardKpis(
    Comparison RevenueCents,
    Comparison Orders,
    Comparison AverageOrderCents,
    Comparison NewCustomers,
    int ToShip,
    int LowStock);

public sealed record DailyRevenue(DateOnly Date, int RevenueCents, int Orders);

public sealed record StatusCount(OrderStatus Status, int Count);

public sealed record TopProduct(int ProductId, string Name, int Quantity, int RevenueCents);

public sealed record LowStockProduct(int ProductId, string Name, int Stock);

// Days are the store's days (Store settings' time zone), from First to Last, today included
public sealed record DashboardResponse(
    DateOnly First,
    DateOnly Last,
    string TimeZoneId,
    DashboardKpis Kpis,
    IReadOnlyList<DailyRevenue> RevenueByDay,
    IReadOnlyList<StatusCount> OrdersByStatus,
    IReadOnlyList<TopProduct> TopProducts,
    IReadOnlyList<LowStockProduct> LowStockProducts);
