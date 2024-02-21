"use client"

import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Layout } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import Image from "next/image";

const CheckoutForm = ()=> {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const currentURL = process.env.NEXT_PUBLIC_URL;
    console.log("url: " , currentURL)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // link to payment completion page
        return_url: `${currentURL}ordersuccess`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, customer will be redirected to
    // `return_url`. For some payment methods like iDEAL, customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    console.log("Error that Occured:", error)
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as Layout, // Specify the type as Layout
  };

  return (
    <div>
        <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" options={paymentElementOptions} />

        {message && <div id="payment-message" className="text-center py-2">{message}</div>}
          <div className="mt-4 flex justify-center">
          {/* Show any error or success messages */}
          <Button disabled={isLoading || !stripe || !elements} id="submit" className={`max-sm:w-full sm:w-3/4 xl:w-2/5 ${isLoading ? "bg-white border border-black" : "bg-black"}`}>
            <span id="button-text">
              {isLoading ?     <Image
             src={"/assets/lineloader.svg"}
             alt={"loader"}
             width={100}
             height={100}
             className={`${isLoading ? "" : "hidden"} mx-auto`}
           /> : "Pay now"}
            </span>
          </Button>
        </div>
        
      </form>
    </div>
  );
}

export default CheckoutForm;