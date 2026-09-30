using System.Collections.Concurrent;
using StoreOps.Api.Domain;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Tests.Infrastructure;

// Stands in for Stripe: remembers what the store asked for, and lets a test play the customer
// (paying) or Stripe (a failing call). Tests need neither a Stripe account nor the network.
public sealed class FakePayments : IPayments
{
    // A flat 8% on products and shipping, so a test can predict the tax
    public const decimal TaxRate = 0.08m;

    private readonly ConcurrentDictionary<string, PaymentIntentState> _intents = new();
    private int _taxRecordingFailures;

    public ConcurrentBag<string> CustomersCreated { get; } = [];
    public ConcurrentBag<string> Refunds { get; } = [];
    public ConcurrentBag<string> TaxRecordedForOrders { get; } = [];

    public int PaymentIntentsCreated => _intents.Count;

    public static int TaxOn(int amountCents) => (int)Math.Round(amountCents * TaxRate, MidpointRounding.AwayFromZero);

    // The customer completes the payment in the browser
    public PaymentIntentState Pay(string paymentIntentId) =>
        _intents.AddOrUpdate(paymentIntentId, _ => throw new KeyNotFoundException(paymentIntentId),
            (_, intent) => intent with { Status = PaymentIntentState.Succeeded, AmountReceivedCents = intent.AmountCents });

    public PaymentIntentState IntentOf(string paymentIntentId) => _intents[paymentIntentId];

    // The next attempt to record tax fails, as if Stripe were briefly down
    public void FailNextTaxRecording() => Interlocked.Increment(ref _taxRecordingFailures);

    public Task<string> CreateCustomerAsync(int userId, string email, CancellationToken ct)
    {
        var id = $"cus_test_{userId}";
        CustomersCreated.Add(id);
        return Task.FromResult(id);
    }

    public Task<TaxQuote> CalculateTaxAsync(IReadOnlyList<TaxLine> lines, int shippingCents, PostalAddress shipTo, CancellationToken ct) =>
        Task.FromResult(new TaxQuote($"taxcalc_test_{Guid.NewGuid():N}", TaxOn(lines.Sum(l => l.AmountCents) + shippingCents)));

    public Task<PaymentIntentState> CreatePaymentIntentAsync(string customerId, int amountCents, int userId, CancellationToken ct)
    {
        var id = $"pi_test_{Guid.NewGuid():N}";
        return Task.FromResult(_intents[id] = new PaymentIntentState(
            id, $"{id}_secret_test", PaymentIntentState.RequiresPaymentMethod, amountCents, 0));
    }

    public Task<PaymentIntentState> UpdatePaymentIntentAsync(string paymentIntentId, int amountCents, CancellationToken ct)
    {
        var intent = _intents[paymentIntentId];
        if (!intent.CanChangeAmount)
            throw new InvalidOperationException("Stripe refuses to change the amount of a paid PaymentIntent.");
        return Task.FromResult(_intents[paymentIntentId] = intent with { AmountCents = amountCents });
    }

    public Task<PaymentIntentState> GetPaymentIntentAsync(string paymentIntentId, CancellationToken ct) =>
        Task.FromResult(_intents[paymentIntentId]);

    public Task CancelPaymentIntentAsync(string paymentIntentId, CancellationToken ct)
    {
        _intents[paymentIntentId] = _intents[paymentIntentId] with { Status = PaymentIntentState.Canceled };
        return Task.CompletedTask;
    }

    public Task RefundAsync(string paymentIntentId, CancellationToken ct)
    {
        Refunds.Add(paymentIntentId);
        return Task.CompletedTask;
    }

    public Task<string> RecordTaxAsync(string calculationId, string orderNumber, CancellationToken ct)
    {
        if (Interlocked.Decrement(ref _taxRecordingFailures) >= 0)
            throw new HttpRequestException("Stripe is unavailable (simulated).");
        Interlocked.Exchange(ref _taxRecordingFailures, 0);

        TaxRecordedForOrders.Add(orderNumber);
        return Task.FromResult($"taxtxn_test_{orderNumber}");
    }
}
