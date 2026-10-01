"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Loading from "@/app/(auth)/loading";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import CheckoutForm from "./CheckoutForm";
import OrderDetails from "./OrderDetails";
import { api } from "@/lib/api/browser";
import { problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { Address, Checkout as Quote } from "@/lib/api/types";
import { addressOneLine } from "@/lib/format";
import { formatMoney } from "@/lib/money";

// Loaded once, outside render, so Stripe.js isn't fetched again on every render. Without a publishable
// key the store can't take payments, and the page says so instead of failing inside Stripe.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const appearance: StripeElementsOptions["appearance"] = { theme: "stripe" };

// Asks the API for a quote (it prices the cart, ships to the address and has Stripe Tax add the tax),
// then shows Stripe's Payment Element for it. Nothing about the amount comes from this page.
const Checkout = ({ address }: { address: Address }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // React runs effects twice in development. One quote per address is enough, so the second run is skipped.
  const startedFor = useRef<number | null>(null);

  useEffect(() => {
    if (startedFor.current === address.id) return;
    startedFor.current = address.id;

    const start = async (retry: boolean): Promise<void> => {
      setQuote(null);
      setProblem(null);
      const { data, error } = await api.POST("/api/checkout", { body: { addressId: address.id } });
      if (data) {
        setQuote(data);
        return;
      }
      // Another tab started checkout at the same moment. Its quote stands; asking again picks it up.
      if (retry && (error as ApiProblem | undefined)?.code === "CHECKOUT_CHANGED") return start(false);
      setProblem(problemMessage(error));
    };

    void start(true);
  }, [address.id]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="outline">
          <Link href="/cart">
            <Image src={"/assets/back.png"} alt="" width={24} height={24} />
            <span className="sr-only">Back to cart</span>
          </Link>
        </Button>
        <h1 className="font-semibold text-lg md:text-xl">Checkout</h1>
      </div>

      {problem || !stripePromise ? (
        <div className="grid gap-4 justify-items-center text-center">
          <p className="text-red-500 text-heading4-bold" role="alert">
            {problem ?? "Payments aren't set up on this store yet."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline"><Link href="/cart">Back to cart</Link></Button>
            <Button asChild variant="outline"><Link href={`/address?address=${address.id}`}>Choose another address</Link></Button>
          </div>
        </div>
      ) : !quote ? (
        <Loading />
      ) : (
        <>
          <OrderDetails lines={quote.lines} />

          <div className="flex flex-col md:grid md:grid-cols-6 gap-6">
            <div className="md:col-span-4 lg:col-span-3 xl:col-span-4 flex flex-col gap-6">
              {/* A new quote can come with a new PaymentIntent, and Elements can't swap it after mounting */}
              <Elements key={quote.clientSecret} options={{ clientSecret: quote.clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            </div>
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading4-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <div className="text-body-bold">Shipping address:</div>
                    <div>{addressOneLine(quote.shipTo)}</div>
                    <Link className="underline hover:text-blue" href={`/address?address=${address.id}`}>
                      Change address
                    </Link>
                  </div>
                  <dl className="grid gap-4">
                    {([
                      ["Subtotal", quote.subtotalCents],
                      ["Shipping", quote.shippingCents],
                      ["Tax", quote.taxCents],
                    ] as const).map(([label, cents]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="text-body-bold">{label}</dt>
                        <dd className="ml-auto text-right">{formatMoney(cents)}</dd>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex gap-2">
                      <dt className="text-body-bold">Total</dt>
                      <dd className="ml-auto text-right font-bold">{formatMoney(quote.totalCents)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Checkout;
