using StoreOps.Api.Account.Models;
using StoreOps.Api.Orders.Models;

namespace StoreOps.Api.Customers.Models;

public enum AccountRole
{
    Customer,
    Admin,
}

// A column and its direction: joined_desc is newest accounts first
public enum AdminCustomerSort
{
    Joined,
    JoinedDesc,
    Username,
    UsernameDesc,
}

public sealed record AdminCustomerQuery(string? Search, AccountRole? Role, AdminCustomerSort Sort, int Page, int PageSize);

public sealed record AdminCustomerSummaryResponse(
    int Id,
    string Username,
    string Email,
    DateTime JoinedAtUtc,
    bool IsAdmin,
    bool IsDisabled,
    int OrderCount);

// SpentCents adds up the orders that weren't cancelled or refunded. RecentOrders are the newest few;
// the orders list filtered by customerId has the rest.
public sealed record AdminCustomerResponse(
    int Id,
    string Username,
    string Email,
    DateTime JoinedAtUtc,
    bool IsAdmin,
    bool IsDisabled,
    int OrderCount,
    int SpentCents,
    IReadOnlyList<AddressResponse> Addresses,
    IReadOnlyList<AdminOrderSummaryResponse> RecentOrders);
