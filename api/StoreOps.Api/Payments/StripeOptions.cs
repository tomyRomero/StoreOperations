namespace StoreOps.Api.Payments;

// Empty until a Stripe test account is set up; then only checkout needs them. Locally they come from
// dotnet user-secrets, in production from the environment (Stripe__SecretKey, Stripe__WebhookSecret).
public sealed class StripeOptions
{
    // sk_test_... or a restricted rk_test_... key. Live keys are refused at startup.
    public string? SecretKey { get; set; }

    // whsec_..., from the Stripe dashboard's webhook settings or `stripe listen`
    public string? WebhookSecret { get; set; }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(SecretKey) && !string.IsNullOrWhiteSpace(WebhookSecret);

    public static bool IsTestModeKey(string? key) =>
        string.IsNullOrEmpty(key) || key.StartsWith("sk_test_", StringComparison.Ordinal) || key.StartsWith("rk_test_", StringComparison.Ordinal);
}
