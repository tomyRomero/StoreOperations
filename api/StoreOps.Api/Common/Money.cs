using System.Globalization;

namespace StoreOps.Api.Common;

public static class Money
{
    private static readonly CultureInfo StoreCulture = CultureInfo.GetCultureInfo("en-US");

    // 1999 -> "$19.99". Prices are whole cents everywhere; this is only for messages.
    public static string Format(int cents) => (cents / 100m).ToString("C", StoreCulture);
}
