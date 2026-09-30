using StoreOps.Api.Common;

namespace StoreOps.Api.Payments;

public static class PaymentErrors
{
    // No Stripe keys yet: checkout and refunds are closed, everything else works
    public static readonly ApiError NotConfigured = new(StatusCodes.Status503ServiceUnavailable, "PAYMENTS_NOT_CONFIGURED",
        "Payments aren't set up on this store yet.");
}
