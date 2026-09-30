using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Tests.Infrastructure;

// Webhook events as Stripe sends them, signed the way Stripe signs them, so the API's real signature
// check runs in every test
public static class StripeEvents
{
    public const string WebhookSecret = "whsec_test_signing_secret";

    public static string PaymentSucceeded(PaymentIntentState intent, int? amountReceivedCents = null) =>
        JsonSerializer.Serialize(new
        {
            id = $"evt_test_{Guid.NewGuid():N}",
            @object = "event",
            api_version = Stripe.StripeConfiguration.ApiVersion,
            created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            livemode = false,
            pending_webhooks = 1,
            type = "payment_intent.succeeded",
            data = new
            {
                @object = new
                {
                    id = intent.Id,
                    @object = "payment_intent",
                    amount = intent.AmountCents,
                    amount_received = amountReceivedCents ?? intent.AmountReceivedCents,
                    currency = "usd",
                    status = "succeeded",
                },
            },
        });

    public static string Other(string type) =>
        JsonSerializer.Serialize(new
        {
            id = $"evt_test_{Guid.NewGuid():N}",
            @object = "event",
            api_version = Stripe.StripeConfiguration.ApiVersion,
            created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            livemode = false,
            type,
            data = new { @object = new { id = $"cus_test_{Guid.NewGuid():N}", @object = "customer" } },
        });

    public static Task<HttpResponseMessage> SendAsync(HttpClient client, string payload, string secret = WebhookSecret)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var signature = Convert.ToHexStringLower(
            HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{timestamp}.{payload}")));

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/stripe/webhook")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json"),
        };
        request.Headers.Add("Stripe-Signature", $"t={timestamp},v1={signature}");
        return client.SendAsync(request, TestContext.Current.CancellationToken);
    }
}
