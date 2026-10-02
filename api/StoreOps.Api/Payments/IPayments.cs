using StoreOps.Api.Domain;

namespace StoreOps.Api.Payments;

public sealed record TaxLine(int ProductId, int AmountCents, int Quantity);

public sealed record TaxQuote(string CalculationId, int TaxCents);

public sealed record PaymentIntentState(string Id, string ClientSecret, string Status, int AmountCents, int AmountReceivedCents)
{
    public const string Succeeded = "succeeded";
    public const string Processing = "processing";
    public const string RequiresPaymentMethod = "requires_payment_method";
    public const string Canceled = "canceled";

    // Stripe only lets the amount change before the customer pays
    public bool CanChangeAmount => Status is RequiresPaymentMethod or "requires_confirmation" or "requires_action";
}

// Every Stripe call the store makes, in one place. The real one is StripePayments; tests use a fake,
// so they need neither a Stripe account nor the network.
public interface IPayments
{
    // A Stripe customer is created at the first checkout, not at sign-up
    Task<string> CreateCustomerAsync(int userId, string email, CancellationToken ct);

    Task<TaxQuote> CalculateTaxAsync(IReadOnlyList<TaxLine> lines, int shippingCents, PostalAddress shipTo, CancellationToken ct);

    Task<PaymentIntentState> CreatePaymentIntentAsync(string customerId, int amountCents, int userId, CancellationToken ct);

    Task<PaymentIntentState> UpdatePaymentIntentAsync(string paymentIntentId, int amountCents, CancellationToken ct);

    Task<PaymentIntentState> GetPaymentIntentAsync(string paymentIntentId, CancellationToken ct);

    Task CancelPaymentIntentAsync(string paymentIntentId, CancellationToken ct);

    // Safe to repeat: a second call for the same payment refunds nothing more
    Task RefundAsync(string paymentIntentId, CancellationToken ct);

    // Commits the tax calculation as a Stripe tax transaction, so the tax is on record. Returns its id.
    Task<string> RecordTaxAsync(string calculationId, string orderNumber, CancellationToken ct);

    // Reverses a recorded tax transaction in full after a refund, so tax reports don't count the sale.
    // Safe to repeat: a second call returns the first reversal.
    Task ReverseTaxAsync(string taxTransactionId, string orderNumber, CancellationToken ct);
}
