using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StoreOps.Api.Cart.Services;
using StoreOps.Api.Checkouts.Models;
using StoreOps.Api.Common;
using StoreOps.Api.Data;
using StoreOps.Api.Domain;
using StoreOps.Api.Images;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Checkouts.Services;

// Turns the customer's cart into a frozen quote tied to one Stripe PaymentIntent. Every amount comes
// from the database and Stripe Tax, never from the browser. Starting checkout again (another address,
// a changed cart, a reload) updates the same quote and the same PaymentIntent.
public sealed class CheckoutService(
    AppDbContext db, CartService cart, IPayments payments, IOptions<StripeOptions> stripe)
{
    public async Task<(CheckoutResponse? Checkout, ApiError? Error)> StartAsync(int userId, int addressId, CancellationToken ct)
    {
        if (!stripe.Value.IsConfigured)
            return (null, PaymentErrors.NotConfigured);

        var address = await db.UserAddresses.AsNoTracking().SingleOrDefaultAsync(a => a.UserId == userId && a.Id == addressId, ct);
        if (address is null)
            return (null, CheckoutErrors.UnknownAddress);

        // The cart's own rules decide whether it can be bought (in the store, in stock)
        var current = await cart.GetAsync(userId, ct);
        if (current.Lines.Count == 0)
            return (null, CheckoutErrors.CartEmpty);
        if (!current.CanCheckout)
            return (null, CheckoutErrors.CartNotReady);

        var lines = await db.CartItems
            .Where(i => i.UserId == userId)
            .Select(i => new CheckoutLine
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                UnitPriceCents = i.Product.PriceCents,
                ImageKey = i.Product.ImageKey,
                Quantity = i.Quantity,
            })
            .ToListAsync(ct);

        var settings = await db.StoreSettings.AsNoTracking().SingleAsync(ct);
        var subtotal = lines.Sum(l => l.UnitPriceCents * l.Quantity);
        var shipping = settings.FreeShippingThresholdCents is { } threshold && subtotal >= threshold ? 0 : settings.ShippingFlatRateCents;
        var tax = await payments.CalculateTaxAsync(
            lines.Select(l => new TaxLine(l.ProductId, l.UnitPriceCents * l.Quantity, l.Quantity)).ToList(),
            shipping, address.Address, ct);
        var total = subtotal + shipping + tax.TaxCents;

        var checkout = await db.Checkouts
            .Include(c => c.Lines)
            .SingleOrDefaultAsync(c => c.UserId == userId && c.Status == CheckoutStatus.Open, ct);

        PaymentIntentState intent;
        if (checkout is null)
        {
            intent = await payments.CreatePaymentIntentAsync(await StripeCustomerIdAsync(userId, ct), total, userId, ct);
            checkout = new Checkout
            {
                UserId = userId,
                StripePaymentIntentId = intent.Id,
                StripeTaxCalculationId = tax.CalculationId,
                ShipTo = address.Address,
            };
            db.Checkouts.Add(checkout);
        }
        else
        {
            // Once the customer has paid (or is paying), the quote is final
            if (!(await payments.GetPaymentIntentAsync(checkout.StripePaymentIntentId, ct)).CanChangeAmount)
                return (null, CheckoutErrors.PaymentInProgress);

            intent = await payments.UpdatePaymentIntentAsync(checkout.StripePaymentIntentId, total, ct);
            checkout.StripeTaxCalculationId = tax.CalculationId;
            checkout.ShipTo = address.Address;
        }

        checkout.SubtotalCents = subtotal;
        checkout.ShippingCents = shipping;
        checkout.TaxCents = tax.TaxCents;
        checkout.TotalCents = total;
        ReplaceLines(checkout, lines);

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return (null, CheckoutErrors.CheckoutChanged);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueViolation())
        {
            // Another tab opened a checkout at the same moment. Its PaymentIntent wins; ours is cancelled.
            await payments.CancelPaymentIntentAsync(intent.Id, ct);
            return (null, CheckoutErrors.CheckoutChanged);
        }

        return (ToResponse(checkout, intent.ClientSecret), null);
    }

    // What the confirmation page shows after Stripe sends the customer back. Null when the payment
    // isn't one of this customer's checkouts.
    public async Task<CheckoutResultResponse?> ResultAsync(int userId, string paymentIntentId, CancellationToken ct)
    {
        if (!await db.Checkouts.AnyAsync(c => c.UserId == userId && c.StripePaymentIntentId == paymentIntentId, ct))
            return null;

        var order = await db.Orders
            .Where(o => o.StripePaymentIntentId == paymentIntentId)
            .Select(o => new { o.OrderNumber, o.Status })
            .SingleOrDefaultAsync(ct);
        if (order is not null)
            return new CheckoutResultResponse(
                order.Status == OrderStatus.Refunded ? PaymentResult.Refunded : PaymentResult.Paid, order.OrderNumber);

        // No order yet: either the webhook hasn't arrived, or the payment didn't go through
        var intent = await payments.GetPaymentIntentAsync(paymentIntentId, ct);
        return new CheckoutResultResponse(
            intent.Status is PaymentIntentState.RequiresPaymentMethod or PaymentIntentState.Canceled
                ? PaymentResult.Failed
                : PaymentResult.Processing,
            null);
    }

    // P2: the Stripe customer is created at the first checkout and kept on the account
    private async Task<string> StripeCustomerIdAsync(int userId, CancellationToken ct)
    {
        var user = await db.Users.SingleAsync(u => u.Id == userId, ct);
        return user.StripeCustomerId ??= await payments.CreateCustomerAsync(userId, user.Email!, ct);
    }

    // Updates the quote's lines in place: lines keyed by product, so a product keeps its row
    private static void ReplaceLines(Checkout checkout, List<CheckoutLine> lines)
    {
        var wanted = lines.ToDictionary(l => l.ProductId);
        checkout.Lines.RemoveAll(l => !wanted.ContainsKey(l.ProductId));

        foreach (var line in lines)
        {
            var existing = checkout.Lines.Find(l => l.ProductId == line.ProductId);
            if (existing is null)
            {
                checkout.Lines.Add(line);
                continue;
            }

            existing.ProductName = line.ProductName;
            existing.UnitPriceCents = line.UnitPriceCents;
            existing.ImageKey = line.ImageKey;
            existing.Quantity = line.Quantity;
        }
    }

    private static CheckoutResponse ToResponse(Checkout checkout, string clientSecret) => new(
        checkout.Id,
        clientSecret,
        checkout.Lines
            .OrderBy(l => l.ProductId)
            .Select(l => new CheckoutLineResponse(
                l.ProductId, l.ProductName, l.UnitPriceCents, l.Quantity, l.UnitPriceCents * l.Quantity, ImageKeys.UrlFor(l.ImageKey)))
            .ToList(),
        checkout.ShipTo,
        checkout.SubtotalCents,
        checkout.ShippingCents,
        checkout.TaxCents,
        checkout.TotalCents);
}
