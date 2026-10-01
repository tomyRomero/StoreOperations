"use client"

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Layout } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import Image from "next/image";

// Stripe's Payment Element for the quote's PaymentIntent. Card details go straight to Stripe and never
// touch this site or the API. After paying, Stripe sends the customer to the confirmation page.
const CheckoutForm = ()=> {
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

  const paymentElementOptions = {
    layout: "tabs" as Layout,
  };

  return (
    <div>
        <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" options={paymentElementOptions} />

        {message && <div id="payment-message" className="text-center py-2" role="alert">{message}</div>}
          <div className="mt-4 flex justify-center">
          <Button disabled={isLoading || !stripe || !elements} id="submit" className={`max-sm:w-full sm:w-3/4 xl:w-2/5 ${isLoading ? "bg-white border border-black" : "bg-black"}`}>
            <span id="button-text">
              {isLoading ? <Image
             src={"/assets/lineloader.svg"}
             alt="Paying"
             width={100}
             height={100}
             className="mx-auto"
           /> : "Pay now"}
            </span>
          </Button>
        </div>

      </form>
    </div>
  );
}

export default CheckoutForm;
