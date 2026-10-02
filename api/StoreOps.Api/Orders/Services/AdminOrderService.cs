using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Emails;
using StoreOps.Api.Images;
using StoreOps.Api.Orders.Models;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Orders.Services;

public static class AdminOrderErrors
{
    public static ApiError NotAllowed(OrderStatus from, OrderStatus to) => new(StatusCodes.Status400BadRequest, "STATUS_NOT_ALLOWED",
        $"An order that is {from.ToString().ToLowerInvariant()} can't become {to.ToString().ToLowerInvariant()}.", Field: "status");

    public static readonly ApiError EditConflict = new(StatusCodes.Status409Conflict, "EDIT_CONFLICT",
        "This order changed after you opened it. Reload to see the latest version, then make your change again.");

    public static ApiError RefundNotConfirmed(int totalCents) => new(StatusCodes.Status400BadRequest, "REFUND_NOT_CONFIRMED",
        $"This refunds {Money.Format(totalCents)} to the customer's card. Confirm the refund to continue.", Field: "confirmRefund");

    public static readonly ApiError RefundFailed = new(StatusCodes.Status502BadGateway, "REFUND_FAILED",
        "Stripe couldn't complete the refund, so the order wasn't changed. Try again: a payment is never refunded twice.");

    public static readonly ApiError RefundedButNotSaved = new(StatusCodes.Status409Conflict, "REFUNDED_BUT_NOT_SAVED",
        "The payment was refunded, but the order changed at the same moment, so its new status wasn't saved. " +
        "Reload the order and make the change again; it won't be refunded twice.");
}

// Orders as the admin sees and moves them on. Every order was paid, so cancelling or refunding one
// gives the money back through Stripe (in full) before the new status is saved.
public sealed class AdminOrderService(
    AppDbContext db,
    StoreEmails emails,
    IPayments payments,
    IOptions<StripeOptions> stripe,
    TimeProvider clock,
    ILogger<AdminOrderService> logger)
{
    // Newest first. Search matches the order number, its email, the customer's username, or the recipient.
    public async Task<Paged<AdminOrderSummaryResponse>> ListAsync(AdminOrderQuery query, CancellationToken ct)
    {
        var orders = db.Orders.AsQueryable();
        if (query.Status is { } status)
            orders = orders.Where(o => o.Status == status);
        if (query.CustomerId is { } customerId)
            orders = orders.Where(o => o.UserId == customerId);
        if (query.Search?.Trim() is { Length: > 0 } search)
            orders = orders.Where(o => o.OrderNumber == search.ToUpper()
                || o.Email.Contains(search)
                || (o.User != null && o.User.UserName!.Contains(search))
                || o.ShipTo.RecipientName.Contains(search));

        var totalCount = await orders.CountAsync(ct);
        // The id breaks ties, so an order never shows up on two pages
        var sorted = query.Sort switch
        {
            AdminOrderSort.Placed => orders.OrderBy(o => o.PlacedAtUtc).ThenBy(o => o.Id),
            AdminOrderSort.Total => orders.OrderBy(o => o.TotalCents).ThenByDescending(o => o.Id),
            AdminOrderSort.TotalDesc => orders.OrderByDescending(o => o.TotalCents).ThenByDescending(o => o.Id),
            _ => orders.OrderByDescending(o => o.PlacedAtUtc).ThenByDescending(o => o.Id),
        };
        var items = await sorted
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(o => new AdminOrderSummaryResponse(
                o.OrderNumber, o.Status, Order.NextStatuses(o.Status), o.PlacedAtUtc,
                o.User != null ? o.User.UserName! : o.ShipTo.RecipientName, o.Email, o.UserId == null,
                o.Lines.Sum(l => l.Quantity), o.TotalCents))
            .ToListAsync(ct);

        return new Paged<AdminOrderSummaryResponse>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<AdminOrderResponse?> GetAsync(string orderNumber, CancellationToken ct)
    {
        var order = await db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Lines)
            .Include(o => o.StatusHistory).ThenInclude(s => s.ChangedBy)
            .AsSplitQuery()
            .SingleOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);

        return order is null ? null : ToResponse(order);
    }

    // Records the shipping details and, if it changed, the new status. Cancelling or refunding refunds
    // the payment first, and an order that never shipped gets its stock back. The customer is emailed if
    // the admin chose to (or, when they didn't say, if the store's default says so).
    public async Task<(AdminOrderResponse? Order, ApiError? Error)> UpdateAsync(
        string orderNumber, UpdateOrderRequest request, int adminId, CancellationToken ct)
    {
        var (refundedCents, refundError) = await RefundIfNeededAsync(orderNumber, request, ct);
        if (refundError is not null)
            return (null, refundError);

        ApiError? error;
        try
        {
            // One transaction: the order, its timeline, returned stock, the activity entry and the email
            error = await db.InTransactionAsync(() => ApplyAsync(orderNumber, request, adminId, refundedCents, ct), ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            error = AdminOrderErrors.EditConflict;
        }

        // Money went back but the order changed at the same moment: say so, rather than "nothing happened"
        if (error is not null && refundedCents is not null)
            return (null, AdminOrderErrors.RefundedButNotSaved);
        return error is not null ? (null, error) : (await GetAsync(orderNumber, ct), null);
    }

    // For a change to Cancelled or Refunded: the same checks the save makes (so money never moves for a
    // change that will be refused), the admin's confirmation, then the refund and the tax reversal.
    // Both Stripe calls are safe to repeat, so a retry after a failure never refunds twice.
    // Returns the amount refunded, or null when this change moves no money.
    private async Task<(int? RefundedCents, ApiError? Error)> RefundIfNeededAsync(
        string orderNumber, UpdateOrderRequest request, CancellationToken ct)
    {
        if (request.Status is not (OrderStatus.Cancelled or OrderStatus.Refunded))
            return (null, null);

        var order = await db.Orders
            .AsNoTracking()
            .Where(o => o.OrderNumber == orderNumber)
            .Select(o => new { o.Status, o.RowVersion, o.TotalCents, o.StripePaymentIntentId, o.StripeTaxTransactionId })
            .SingleOrDefaultAsync(ct);
        if (order is null)
            return (null, ApiError.NotFound);
        if (order.Status == request.Status)
            return (null, null);
        if (!order.RowVersion.AsSpan().SequenceEqual(request.RowVersion))
            return (null, AdminOrderErrors.EditConflict);
        if (!Order.NextStatuses(order.Status).Contains(request.Status))
            return (null, AdminOrderErrors.NotAllowed(order.Status, request.Status));
        if (!request.ConfirmRefund)
            return (null, AdminOrderErrors.RefundNotConfirmed(order.TotalCents));
        if (!stripe.Value.IsConfigured)
            return (null, PaymentErrors.NotConfigured);

        try
        {
            await payments.RefundAsync(order.StripePaymentIntentId, ct);
            if (order.StripeTaxTransactionId is { } taxTransactionId)
                await payments.ReverseTaxAsync(taxTransactionId, orderNumber, ct);
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            logger.LogError(error, "Refunding order {OrderNumber} failed", orderNumber);
            return (null, AdminOrderErrors.RefundFailed);
        }

        logger.LogInformation("Refunded order {OrderNumber} in full", orderNumber);
        return (order.TotalCents, null);
    }

    // The same status change for many orders, each checked and saved on its own with its shipping
    // details as they are. An order already in that status counts as done.
    public async Task<BulkResult<string>> BulkChangeStatusAsync(BulkOrderStatusRequest request, int adminId, CancellationToken ct) =>
        await Bulk.RunAsync(db, request.OrderNumbers, async orderNumber =>
        {
            if (await GetAsync(orderNumber, ct) is not { } current)
                return ApiError.NotFound;
            if (current.Status == request.Status)
                return null;

            var (_, error) = await UpdateAsync(orderNumber, new UpdateOrderRequest
            {
                Status = request.Status,
                Carrier = current.Carrier,
                TrackingNumber = current.TrackingNumber,
                EstimatedDeliveryDate = current.EstimatedDeliveryDate,
                EmailCustomer = request.EmailCustomer,
                ConfirmRefund = request.ConfirmRefund,
                RowVersion = current.RowVersion,
            }, adminId, ct);
            return error;
        });

    private async Task<ApiError?> ApplyAsync(
        string orderNumber, UpdateOrderRequest request, int adminId, int? refundedCents, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(o => o.User)
            .Include(o => o.Lines)
            .Include(o => o.StatusHistory)
            .AsSplitQuery()
            .SingleOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
            return ApiError.NotFound;

        // An update based on an older copy is refused: checked here, before the status rules, so the
        // admin hears what really happened, and again by the save in case the order changes in between
        if (!order.RowVersion.AsSpan().SequenceEqual(request.RowVersion))
            return AdminOrderErrors.EditConflict;
        db.Entry(order).Property(o => o.RowVersion).OriginalValue = request.RowVersion;

        var from = order.Status;
        var statusChanges = request.Status != from;
        if (statusChanges && !order.CanChangeTo(request.Status))
            return AdminOrderErrors.NotAllowed(from, request.Status);

        order.Carrier = request.Carrier;
        order.TrackingNumber = string.IsNullOrWhiteSpace(request.TrackingNumber) ? null : request.TrackingNumber.Trim();
        order.EstimatedDeliveryDate = request.EstimatedDeliveryDate;

        var note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
        if (statusChanges)
        {
            var now = clock.GetUtcNow().UtcDateTime;
            order.ChangeStatus(request.Status, now, adminId, note);

            db.ActivityLog.Add(Activity.Entry(ActivityAction.OrderStatusChanged, ActivityEntity.Order, order.Id, adminId,
                new { order.OrderNumber, from, to = request.Status, refundedCents }, clock));

            var emailCustomer = request.EmailCustomer
                ?? await db.StoreSettings.Select(s => s.EmailCustomerOnStatusUpdateByDefault).SingleAsync(ct);
            if (emailCustomer)
                await emails.AddStatusUpdateAsync(order, note, ct);
        }

        // The order is saved first, so an edit from an older copy fails before any stock moves
        await db.SaveChangesAsync(ct);

        // It never left the shop, so its stock can be sold again. Added in the database, like the
        // webhook takes it, so a sale of the same product at the same moment isn't lost.
        if (statusChanges && from == OrderStatus.Pending && request.Status is OrderStatus.Cancelled or OrderStatus.Refunded)
        {
            foreach (var line in order.Lines)
                await db.Products
                    .Where(p => p.Id == line.ProductId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock + line.Quantity), ct);
        }

        return null;
    }

    private static AdminOrderResponse ToResponse(Order order) => new(
        order.OrderNumber,
        order.Status,
        Order.NextStatuses(order.Status),
        order.PlacedAtUtc,
        order.UserId,
        order.User?.UserName ?? order.ShipTo.RecipientName,
        order.Email,
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
            .Select(s => new AdminOrderStepResponse(s.Status, s.ChangedAtUtc, s.Note, s.ChangedBy?.UserName))
            .ToList(),
        order.StripePaymentIntentId,
        order.RowVersion);
}
