using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Checkouts.Services;

public sealed record PlacedOrder(int Id, string OrderNumber, OrderStatus Status, string StripeTaxCalculationId, string? StripeTaxTransactionId);

// Turns a paid checkout into an order. Stripe may deliver the same webhook more than once, or two
// deliveries at the same moment; every step is safe to repeat, and the unique PaymentIntent id on
// orders means there is only ever one order per payment.
public sealed class OrderPlacement(AppDbContext db, IPayments payments, TimeProvider clock, ILogger<OrderPlacement> logger)
{
    // No 0/O or 1/I, so a number read out over the phone can't be misheard
    private const string OrderNumberAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    private static readonly JsonSerializerOptions DetailsJson = new(JsonSerializerDefaults.Web);

    public async Task PlaceAsync(string paymentIntentId, int amountReceivedCents, CancellationToken ct)
    {
        var order = await FindAsync(paymentIntentId, ct);
        if (order is null)
        {
            var checkout = await db.Checkouts
                .AsNoTracking()
                .Include(c => c.Lines)
                .SingleOrDefaultAsync(c => c.StripePaymentIntentId == paymentIntentId, ct);
            if (checkout is null)
            {
                // Not one of ours (another app on the same Stripe account, or a checkout from a reset database)
                logger.LogWarning("Payment {PaymentIntentId} matches no checkout; ignored", paymentIntentId);
                return;
            }

            order = await CreateAsync(checkout, amountReceivedCents, ct);
        }

        // The order is safely stored. Now the Stripe calls that complete it; if one fails the webhook
        // fails, and Stripe's retry lands here again with only the missing step left to do.
        if (order.Status == OrderStatus.Refunded)
        {
            await payments.RefundAsync(paymentIntentId, ct);
        }
        else if (order.StripeTaxTransactionId is null)
        {
            var transactionId = await payments.RecordTaxAsync(order.StripeTaxCalculationId, order.OrderNumber, ct);
            await db.Orders
                .Where(o => o.Id == order.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(o => o.StripeTaxTransactionId, transactionId), ct);
        }
    }

    private async Task<PlacedOrder> CreateAsync(Checkout checkout, int amountReceivedCents, CancellationToken ct)
    {
        try
        {
            return await db.InTransactionAsync(() => CreateInTransactionAsync(checkout, amountReceivedCents, ct), ct);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            // A second delivery of the same webhook placed it a moment ago; this attempt was rolled back.
            // Anything else (an order number clash) fails the webhook, and Stripe's retry draws a new number.
            if (await FindAsync(checkout.StripePaymentIntentId, ct) is { } placedMeanwhile)
                return placedMeanwhile;
            throw;
        }
    }

    private async Task<PlacedOrder> CreateInTransactionAsync(Checkout checkout, int amountReceivedCents, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;

        // D-27: the money received must match the quote exactly. P4: every line must still be in stock.
        var refundNote = amountReceivedCents != checkout.TotalCents
            ? "Your cart changed while you were paying, so we refunded this payment in full. Please check out again."
            : !await TakeStockAsync(checkout.Lines, ct)
                ? "An item sold out while you were paying, so we refunded this payment in full."
                : null;

        var order = new Order
        {
            OrderNumber = RandomNumberGenerator.GetString(OrderNumberAlphabet, 8),
            UserId = checkout.UserId,
            Status = refundNote is null ? OrderStatus.Pending : OrderStatus.Refunded,
            ShipTo = checkout.ShipTo,
            SubtotalCents = checkout.SubtotalCents,
            ShippingCents = checkout.ShippingCents,
            TaxCents = checkout.TaxCents,
            TotalCents = checkout.TotalCents,
            StripePaymentIntentId = checkout.StripePaymentIntentId,
            StripeTaxCalculationId = checkout.StripeTaxCalculationId,
            PlacedAtUtc = now,
            Lines = checkout.Lines.Select(l => new OrderLine
            {
                ProductId = l.ProductId,
                ProductName = l.ProductName,
                UnitPriceCents = l.UnitPriceCents,
                ImageKey = l.ImageKey,
                Quantity = l.Quantity,
            }).ToList(),
            // The system placed it, so no one is named as the changer
            StatusHistory = [new OrderStatusChange { Status = OrderStatus.Pending, ChangedAtUtc = now }],
        };
        if (refundNote is not null)
            order.StatusHistory.Add(new OrderStatusChange { Status = OrderStatus.Refunded, ChangedAtUtc = now, Note = refundNote });
        db.Orders.Add(order);

        await db.Checkouts
            .Where(c => c.Id == checkout.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.Status, CheckoutStatus.Completed)
                .SetProperty(c => c.CompletedAtUtc, now), ct);

        // Bought products leave the cart. After a refund the cart stays, so the customer can try again.
        if (refundNote is null)
        {
            var bought = checkout.Lines.Select(l => l.ProductId).ToList();
            await db.CartItems
                .Where(i => i.UserId == checkout.UserId && bought.Contains(i.ProductId))
                .ExecuteDeleteAsync(ct);
        }

        await db.SaveChangesAsync(ct);

        db.ActivityLog.Add(new ActivityLogEntry
        {
            Action = ActivityAction.OrderCreated,
            EntityType = ActivityEntity.Order,
            EntityId = order.Id,
            OccurredAtUtc = now,
            DetailsJson = JsonSerializer.Serialize(
                new { order.OrderNumber, order.TotalCents, refunded = refundNote is not null }, DetailsJson),
        });
        await db.SaveChangesAsync(ct);

        return new PlacedOrder(order.Id, order.OrderNumber, order.Status, order.StripeTaxCalculationId, null);
    }

    // Takes each line's stock with one UPDATE that only succeeds while enough is left, so stock can
    // never go below zero. If a line can't be filled, the lines already taken are put back.
    private async Task<bool> TakeStockAsync(IEnumerable<CheckoutLine> lines, CancellationToken ct)
    {
        var taken = new List<CheckoutLine>();
        foreach (var line in lines)
        {
            var updated = await db.Products
                .Where(p => p.Id == line.ProductId && p.Stock >= line.Quantity)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - line.Quantity), ct);
            if (updated == 1)
            {
                taken.Add(line);
                continue;
            }

            foreach (var put in taken)
                await db.Products
                    .Where(p => p.Id == put.ProductId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock + put.Quantity), ct);
            return false;
        }

        return true;
    }

    private Task<PlacedOrder?> FindAsync(string paymentIntentId, CancellationToken ct) =>
        db.Orders
            .Where(o => o.StripePaymentIntentId == paymentIntentId)
            .Select(o => new PlacedOrder(o.Id, o.OrderNumber, o.Status, o.StripeTaxCalculationId, o.StripeTaxTransactionId))
            .SingleOrDefaultAsync(ct);
}
