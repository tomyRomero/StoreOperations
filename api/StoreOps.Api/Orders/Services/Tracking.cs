using StoreOps.Api.Domain;

namespace StoreOps.Api.Orders.Services;

public static class Tracking
{
    // The carrier's own tracking page, when both the carrier and the number are known
    public static string? UrlFor(Carrier? carrier, string? trackingNumber)
    {
        if (string.IsNullOrWhiteSpace(trackingNumber))
            return null;

        var number = Uri.EscapeDataString(trackingNumber.Trim());
        return carrier switch
        {
            Carrier.Ups => $"https://www.ups.com/track?tracknum={number}",
            Carrier.Usps => $"https://tools.usps.com/go/TrackConfirmAction?tLabels={number}",
            Carrier.FedEx => $"https://www.fedex.com/fedextrack/?trknbr={number}",
            Carrier.Dhl => $"https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id={number}",
            _ => null,
        };
    }
}
