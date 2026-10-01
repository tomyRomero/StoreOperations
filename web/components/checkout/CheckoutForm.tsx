"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { LockKeyhole } from "lucide-react";
import { Button } from "../ui/button";
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
        <p id="payment-message" role="alert" className="text-sm font-semibold text-sale">
          {message}
        </p>
      )}

      <Button id="submit" size="lg" className="w-full" disabled={!stripe || !elements} loading={isLoading}>
        Pay {formatMoney(totalCents)}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <LockKeyhole className="size-3.5" aria-hidden />
        Secured by Stripe. Your card details never reach our servers.
      </p>
    </form>
  );
};

export default CheckoutForm;
