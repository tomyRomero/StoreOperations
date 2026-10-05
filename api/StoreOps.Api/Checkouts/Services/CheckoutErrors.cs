using StoreOps.Api.Common;

namespace StoreOps.Api.Checkouts.Services;

public static class CheckoutErrors
{
    public static readonly ApiError UnknownAddress = new(StatusCodes.Status400BadRequest, "UNKNOWN_ADDRESS",
        "Choose one of your saved addresses.", Field: "addressId");

    public static readonly ApiError GuestCheckoutOff = new(StatusCodes.Status403Forbidden, "GUEST_CHECKOUT_OFF",
        "Sign in or create an account to check out.");

    public static readonly ApiError CartEmpty = new(StatusCodes.Status409Conflict, "CART_EMPTY",
        "Your cart is empty.");

    public static readonly ApiError CartNotReady = new(StatusCodes.Status409Conflict, "CART_NOT_READY",
        "Some items in your cart can't be bought right now. Check your cart and try again.");

    public static readonly ApiError PaymentInProgress = new(StatusCodes.Status409Conflict, "PAYMENT_IN_PROGRESS",
        "This checkout is already being paid. Wait for the confirmation.");

    public static readonly ApiError CheckoutChanged = new(StatusCodes.Status409Conflict, "CHECKOUT_CHANGED",
        "Your checkout changed in another tab. Try again.");
}
