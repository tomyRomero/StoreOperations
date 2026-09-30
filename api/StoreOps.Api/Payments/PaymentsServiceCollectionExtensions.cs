namespace StoreOps.Api.Payments;

public static class PaymentsServiceCollectionExtensions
{
    public static IServiceCollection AddPayments(this IServiceCollection services)
    {
        // Test mode only: a live key stops the API from starting
        services.AddOptions<StripeOptions>()
            .BindConfiguration("Stripe")
            .Validate(o => StripeOptions.IsTestModeKey(o.SecretKey),
                "Stripe:SecretKey must be a test-mode key (sk_test_... or rk_test_...). Live keys are refused.")
            .Validate(o => string.IsNullOrEmpty(o.WebhookSecret) || o.WebhookSecret.StartsWith("whsec_", StringComparison.Ordinal),
                "Stripe:WebhookSecret must start with whsec_.")
            .ValidateOnStart();

        services.AddSingleton<IPayments, StripePayments>();
        return services;
    }
}
