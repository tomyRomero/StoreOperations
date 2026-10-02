"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, FlaskConical } from "lucide-react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ErrorState } from "../shared/ErrorState";
import { useCurrentUser } from "../CurrentUserProvider";
import { CheckoutForm } from "./CheckoutForm";
import { OrderLines, OrderTotals } from "./OrderLines";
import { api } from "@/lib/api/browser";
import { problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { Address, Checkout as Quote } from "@/lib/api/types";
import { addressLines } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { useTheme } from "@/lib/use-theme";

// Loaded once, outside render, so Stripe.js isn't fetched again on every render. Without a publishable
// key the store can't take payments, and the page says so instead of failing inside Stripe.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Test keys take no real money; the payment step then says which card to use
const testMode = publishableKey?.startsWith("pk_test_") ?? false;

// The Payment Element in the store's colors, light or dark with the page (it renders in Stripe's own
// frame, so it can't use the CSS). Presentation only: nothing here touches the amount or the payment.
function appearanceFor(theme: "light" | "dark"): StripeElementsOptions["appearance"] {
  const dark = theme === "dark";
  return {
    theme: dark ? "night" : "stripe",
    variables: {
      colorPrimary: dark ? "#a48cff" : "#6d4df2",
      colorBackground: dark ? "#111114" : "#ffffff",
      colorText: dark ? "#f4f4f5" : "#0c0c12",
      colorTextSecondary: dark ? "#a1a1aa" : "#55555e",
      colorTextPlaceholder: dark ? "#a1a1aa" : "#55555e",
      colorDanger: dark ? "#fca5a5" : "#b91c1c",
      borderRadius: "14px",
      spacingUnit: "4px",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    rules: {
      ".Input": { borderColor: dark ? "#6b6b74" : "#8a8a93", boxShadow: "none", padding: "14px" },
      ".Input:focus": { borderColor: "#8b6cff", boxShadow: "0 0 0 4px rgba(139, 108, 255, 0.18)" },
      ".Tab": { borderColor: dark ? "#6b6b74" : "#8a8a93", boxShadow: "none" },
      // Stripe's night theme fills the chosen tab with the primary color, too light for its label;
      // both modes keep the card background and mark the choice with the ring and violet text
      ".Tab--selected": { borderColor: "#8b6cff", boxShadow: "0 0 0 1px #8b6cff", backgroundColor: dark ? "#111114" : "#ffffff", color: dark ? "#c9bcff" : "#5b3fd9" },
      ".TabIcon--selected": { fill: dark ? "#c9bcff" : "#5b3fd9" },
      ".TabLabel--selected": { color: dark ? "#c9bcff" : "#5b3fd9" },
    },
  };
}

// Asks the API for a quote (it prices the cart, ships to the address and has Stripe Tax add the tax),
// then shows Stripe's Payment Element for it. Nothing about the amount comes from this page.
export function Checkout({ address }: { address: Address }) {
  const user = useCurrentUser();
  const { theme } = useTheme();
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
    <div className="grid gap-4.5">
      <OrderLines lines={quote.lines} />
      <OrderTotals totals={quote} state={quote.shipTo.state} />
    </div>
  );

  const facts = [
    ...(user ? [["Contact", user.email, null] as const] : []),
    ["Ship to", `${quote.shipTo.recipientName} · ${addressLines(quote.shipTo).join(", ")}`, changeAddress] as const,
    ["Delivery", `Standard, tracked · ${quote.shippingCents === 0 ? "Free" : formatMoney(quote.shippingCents)}`, null] as const,
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-12">
      <div className="grid gap-7">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-5xl">Pay and you&apos;re done</h1>

        {/* On phones the summary folds away here, with the total on show */}
        <details className="group rounded-[20px] border bg-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4.5 font-semibold [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              Your order
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            </span>
            <span className="font-mono tabular-nums">{formatMoney(quote.totalCents)}</span>
          </summary>
          <div className="border-t border-foreground/8 p-4.5">{summary}</div>
        </details>

        <dl className="grid rounded-[20px] border bg-card">
          {facts.map(([term, value, href]) => (
            <div key={term} className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4 border-b border-foreground/6 px-5 py-4 last:border-b-0 sm:grid-cols-[90px_minmax(0,1fr)]">
              <dt className="text-[13px] text-muted-foreground">{term}</dt>
              <dd className="flex min-w-0 items-center justify-between gap-4 text-sm">
                <span className="min-w-0 break-words">{value}</span>
                {href && (
                  <Link href={href} className="shrink-0 text-[13px] font-medium text-accent underline-offset-3 hover:underline">
                    Change<span className="sr-only"> the address</span>
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="payment-heading" className="grid gap-4">
          <h2 id="payment-heading" className="font-sans text-lg font-semibold">
            Payment
          </h2>
          {testMode && (
            <p className="flex gap-2.5 rounded-[14px] border border-glow-amber/25 bg-warning-subtle px-3.5 py-3 text-[13px] leading-normal text-warning">
              <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                This store is in test mode, so no real money moves. Pay with card <span className="font-mono">4242 4242 4242 4242</span>, any future date and any
                three-digit security code.
              </span>
            </p>
          )}
          {/* A new quote can come with a new PaymentIntent, and Elements can't swap it after mounting. The
              appearance can change, so switching light and dark restyles the card form in place. */}
          <Elements key={quote.clientSecret} options={{ clientSecret: quote.clientSecret, appearance: appearanceFor(theme ?? "light") }} stripe={stripePromise}>
            <CheckoutForm totalCents={quote.totalCents} />
          </Elements>
        </section>
      </div>

      <aside aria-labelledby="summary-heading" className="rounded-[28px] border bg-card p-6.5 max-lg:hidden lg:sticky lg:top-8">
        <h2 id="summary-heading" className="mb-4.5 font-sans text-lg font-semibold">
          Your order
        </h2>
        {summary}
      </aside>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12" aria-busy="true" aria-label="Preparing your payment">
      <div className="grid gap-6">
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <Skeleton className="h-40 rounded-[20px]" />
        <Skeleton className="h-72 rounded-[20px]" />
      </div>
      <Skeleton className="h-96 rounded-[28px] max-lg:hidden" />
    </div>
  );
}
