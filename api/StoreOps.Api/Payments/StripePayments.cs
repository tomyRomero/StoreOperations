using System.Globalization;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Tax;
using StoreOps.Api.Domain;

namespace StoreOps.Api.Payments;

// The store's Stripe calls. Amounts are USD cents and prices are tax-exclusive (tax is added on top).
// Stripe.net retries network failures itself, sending an idempotency key with each retry, so a
// dropped connection never creates a second customer, payment or refund.
public sealed class StripePayments(IOptions<StripeOptions> options) : IPayments
{
    private const string Currency = "usd";

    private readonly Lazy<StripeClient> _client = new(() => new StripeClient(
        options.Value.IsConfigured ? options.Value.SecretKey : throw new InvalidOperationException("Stripe is not set up.")));

    private StripeClient Client => _client.Value;

    public async Task<string> CreateCustomerAsync(int userId, string email, CancellationToken ct)
    {
        var customer = await new CustomerService(Client).CreateAsync(new CustomerCreateOptions
        {
            Email = email,
            Metadata = new Dictionary<string, string> { ["user_id"] = Id(userId) },
        }, new RequestOptions { IdempotencyKey = $"customer-for-user-{userId}" }, ct);
        return customer.Id;
    }

    // Shipping is part of the calculation, so Stripe applies each location's rule for taxing it
    public async Task<TaxQuote> CalculateTaxAsync(
        IReadOnlyList<TaxLine> lines, int shippingCents, PostalAddress shipTo, CancellationToken ct)
    {
        var calculation = await new CalculationService(Client).CreateAsync(new CalculationCreateOptions
        {
            Currency = Currency,
            CustomerDetails = new CalculationCustomerDetailsOptions
            {
                AddressSource = "shipping",
                Address = new AddressOptions
                {
                    Line1 = shipTo.Line1,
                    Line2 = shipTo.Line2,
                    City = shipTo.City,
                    State = shipTo.State,
                    PostalCode = shipTo.PostalCode,
                    Country = shipTo.CountryCode,
                },
            },
            LineItems = lines.Select(line => new CalculationLineItemOptions
            {
                // The line's total, not the unit price
                Amount = line.AmountCents,
                Quantity = line.Quantity,
                Reference = $"product-{Id(line.ProductId)}",
                TaxBehavior = "exclusive",
            }).ToList(),
            ShippingCost = new CalculationShippingCostOptions { Amount = shippingCents, TaxBehavior = "exclusive" },
        }, cancellationToken: ct);

        return new TaxQuote(calculation.Id, checked((int)calculation.TaxAmountExclusive));
    }

    public async Task<PaymentIntentState> CreatePaymentIntentAsync(string customerId, int amountCents, int userId, CancellationToken ct)
    {
        // No setup_future_usage, so the card isn't saved to the customer
        var intent = await new PaymentIntentService(Client).CreateAsync(new PaymentIntentCreateOptions
        {
            Amount = amountCents,
            Currency = Currency,
            Customer = customerId,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            // Only a reference; the webhook finds the checkout by the PaymentIntent's own id
            Metadata = new Dictionary<string, string> { ["user_id"] = Id(userId) },
        }, cancellationToken: ct);
        return State(intent);
    }

    public async Task<PaymentIntentState> UpdatePaymentIntentAsync(string paymentIntentId, int amountCents, CancellationToken ct) =>
        State(await new PaymentIntentService(Client).UpdateAsync(
            paymentIntentId, new PaymentIntentUpdateOptions { Amount = amountCents }, cancellationToken: ct));

    public async Task<PaymentIntentState> GetPaymentIntentAsync(string paymentIntentId, CancellationToken ct) =>
        State(await new PaymentIntentService(Client).GetAsync(paymentIntentId, cancellationToken: ct));

    public async Task CancelPaymentIntentAsync(string paymentIntentId, CancellationToken ct) =>
        await new PaymentIntentService(Client).CancelAsync(paymentIntentId, cancellationToken: ct);

    public async Task RefundAsync(string paymentIntentId, CancellationToken ct)
    {
        try
        {
            await new RefundService(Client).CreateAsync(
                new RefundCreateOptions { PaymentIntent = paymentIntentId },
                new RequestOptions { IdempotencyKey = $"refund-{paymentIntentId}" }, ct);
        }
        catch (StripeException error) when (error.StripeError?.Code == "charge_already_refunded")
        {
            // Refunded by an earlier attempt: nothing left to do
        }
    }

    public async Task<string> RecordTaxAsync(string calculationId, string orderNumber, CancellationToken ct)
    {
        var transaction = await new TransactionService(Client).CreateFromCalculationAsync(
            new TransactionCreateFromCalculationOptions { Calculation = calculationId, Reference = orderNumber },
            new RequestOptions { IdempotencyKey = $"tax-for-order-{orderNumber}" }, ct);
        return transaction.Id;
    }

    public async Task ReverseTaxAsync(string taxTransactionId, string orderNumber, CancellationToken ct) =>
        await new TransactionService(Client).CreateReversalAsync(
            new TransactionCreateReversalOptions
            {
                Mode = "full",
                OriginalTransaction = taxTransactionId,
                Reference = $"{orderNumber}-refund",
            },
            new RequestOptions { IdempotencyKey = $"tax-reversal-for-order-{orderNumber}" }, ct);

    private static PaymentIntentState State(PaymentIntent intent) => new(
        intent.Id, intent.ClientSecret, intent.Status, checked((int)intent.Amount), checked((int)intent.AmountReceived));

    private static string Id(int id) => id.ToString(CultureInfo.InvariantCulture);
}
