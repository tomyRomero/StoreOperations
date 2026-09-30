using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using StoreOps.Api.Checkouts.Services;
using StoreOps.Api.Payments;

namespace StoreOps.Api.Checkouts.Controllers;

// Stripe calls this; nobody else can, because every request must carry Stripe's signature made
// with the webhook secret. The only route the API exposes to the internet besides the site.
[ApiController]
[Route("api/stripe/webhook")]
[AllowAnonymous]
public sealed class StripeWebhookController(OrderPlacement placement, IOptions<StripeOptions> stripe) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Receive(CancellationToken ct)
    {
        if (!stripe.Value.IsConfigured)
            return NotFound();

        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(ct);

        Event stripeEvent;
        try
        {
            // Checks the signature and its timestamp (a replayed old event is refused)
            stripeEvent = EventUtility.ConstructEvent(
                json, Request.Headers["Stripe-Signature"], stripe.Value.WebhookSecret, throwOnApiVersionMismatch: false);
        }
        catch (StripeException)
        {
            return BadRequest();
        }

        if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded && stripeEvent.Data.Object is PaymentIntent intent)
            await placement.PlaceAsync(intent.Id, checked((int)intent.AmountReceived), ct);

        // Every other event is acknowledged and ignored, so Stripe stops sending it
        return Ok();
    }
}
