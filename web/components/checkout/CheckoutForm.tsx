"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { formatMoney } from "@/lib/money";

// Stripe's Payment Element for the quote's PaymentIntent. Card details go straight to Stripe and never
// touch this site or the API. After paying, Stripe sends the customer to the confirmation page.
const CheckoutForm = ({ totalCents }: { totalCents: number }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Stripe.js hasn't loaded yet; the button stays disabled until it has
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/ordersuccess`,
      },
    });

    // Only reached when confirming failed straight away (a declined card, a missing field). Otherwise
    // Stripe has already sent the customer to return_url.
    setMessage(error.type === "card_error" || error.type === "validation_error"
      ? error.message
      : "An unexpected error occurred.");

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="grid gap-4">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      {message && (
        <p id="payment-message" role="alert" className="text-sm font-semibold text-destructive">
          {message}
        </p>
      )}

      <button
        id="submit"
        disabled={!stripe || !elements || isLoading}
        aria-busy={isLoading || undefined}
        className="mt-2 inline-flex h-[62px] w-full items-center justify-center gap-2.5 rounded-button bg-primary text-[17px] font-semibold text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_24px_60px_color-mix(in_oklab,var(--glow-blue)_35%,transparent)] transition-colors hover:bg-primary/85 disabled:opacity-70"
      >
        {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <LockKeyhole className="size-4" aria-hidden />}
        Pay {formatMoney(totalCents)}
      </button>
      <p className="text-center text-[13px] text-muted-foreground">Card details go straight to Stripe and never touch our servers.</p>
    </form>
  );
};

export default CheckoutForm;
