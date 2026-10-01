"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ErrorState } from "../shared/ErrorState";
import CheckoutForm from "./CheckoutForm";
import { OrderLines, OrderTotals } from "./OrderLines";
import { api } from "@/lib/api/browser";
import { problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { Address, Checkout as Quote } from "@/lib/api/types";
import { addressLines } from "@/lib/format";
import { formatMoney } from "@/lib/money";

// Loaded once, outside render, so Stripe.js isn't fetched again on every render. Without a publishable
// key the store can't take payments, and the page says so instead of failing inside Stripe.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// The Payment Element in the store's colors (it renders in Stripe's own frame, so it can't use the CSS)
const appearance: StripeElementsOptions["appearance"] = {
  theme: "stripe",
  variables: {
    colorPrimary: "#111318",
    colorText: "#111318",
    colorDanger: "#c42b1c",
    colorTextPlaceholder: "#555b66",
    borderRadius: "4px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  rules: {
    ".Input": { borderColor: "#868c97", boxShadow: "none" },
    ".Input:focus": { borderColor: "#b8168f", boxShadow: "0 0 0 1px #b8168f" },
  },
};

// Asks the API for a quote (it prices the cart, ships to the address and has Stripe Tax add the tax),
// then shows Stripe's Payment Element for it. Nothing about the amount comes from this page.
const Checkout = ({ address }: { address: Address }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // React runs effects twice in development. One quote per address is enough, so the second run is skipped.
  const startedFor = useRef<number | null>(null);

  useEffect(() => {
    // Without Stripe in this browser nothing could be paid, so no quote is asked for
    if (!stripePromise || startedFor.current === address.id) return;
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

  const changeAddress = `/address?address=${address.id}`;

  if (problem || !stripePromise) {
    return (
      <ErrorState
        title={problem ? "We couldn't start your payment" : "Payments aren't set up yet"}
        action={
          <>
            <Button asChild>
              <Link href="/cart">Back to bag</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={changeAddress}>Choose another address</Link>
            </Button>
          </>
        }
      >
        {problem ?? "This store hasn't connected its payment provider yet, so orders can't be paid for. Your bag is saved."}
      </ErrorState>
    );
  }

  if (!quote) return <CheckoutSkeleton />;

  const summary = (
    <div className="grid gap-5">
      <OrderLines lines={quote.lines} />
      <OrderTotals totals={quote} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
      {/* On phones the summary folds away at the top, with the total on show */}
      <details className="group rounded-md border lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            Order summary
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </span>
          <span className="tabular-nums">{formatMoney(quote.totalCents)}</span>
        </summary>
        <div className="border-t p-4">{summary}</div>
      </details>

      <div className="grid gap-6">
        <section aria-labelledby="ship-to-heading" className="flex items-start justify-between gap-4 rounded-md border p-5">
          <div className="grid gap-1 text-sm">
            <h2 id="ship-to-heading" className="font-sans text-sm font-semibold text-muted-foreground">
              Shipping to
            </h2>
            <p className="font-semibold">{quote.shipTo.recipientName}</p>
            {addressLines(quote.shipTo).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <Link href={changeAddress} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
            Change
          </Link>
        </section>

        <section aria-labelledby="payment-heading" className="grid gap-4 rounded-md border p-5">
          <h2 id="payment-heading" className="text-h3">
            Payment
          </h2>
          {/* A new quote can come with a new PaymentIntent, and Elements can't swap it after mounting */}
          <Elements key={quote.clientSecret} options={{ clientSecret: quote.clientSecret, appearance }} stripe={stripePromise}>
            <CheckoutForm totalCents={quote.totalCents} />
          </Elements>
        </section>
      </div>

      <section aria-labelledby="summary-heading" className="rounded-md border p-5 max-lg:hidden lg:sticky lg:top-28">
        <h2 id="summary-heading" className="mb-5 text-h3">
          Order summary
        </h2>
        {summary}
      </section>
    </div>
  );
};

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10" aria-busy="true" aria-label="Preparing your payment">
      <div className="grid gap-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-80 max-lg:hidden" />
    </div>
  );
}

export default Checkout;
