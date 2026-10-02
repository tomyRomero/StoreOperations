"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleCheck, CircleX, Clock, LoaderCircle, RotateCcw, SearchX, type LucideIcon } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import { useCurrentUser } from "../CurrentUserProvider";
import { OrderLines, OrderTotals } from "./OrderLines";
import { api } from "@/lib/api/browser";
import type { Order, PaymentResult } from "@/lib/api/types";
import { addressLines } from "@/lib/format";
import { cn } from "@/lib/utils";

type Outcome = PaymentResult | "not_found" | "unknown";

// Stripe tells the API about a payment through a webhook, usually within a second or two of the
// customer arriving here. Until the order exists the answer is "processing", so this asks again
// for a little while before saying it's still working on it.
const attempts = 20;
const delayMs = 1500;

export function OrderResult({ paymentIntentId, supportEmail }: { paymentIntentId: string; supportEmail: string | null }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const { refresh: refreshCart } = useCart();

  useEffect(() => {
    let stopped = false;

    const check = async (attempt: number) => {
      const { data, response } = await api.GET("/api/checkout/result", { params: { query: { paymentIntentId } } });
      if (stopped) return;

      if (!data) {
        setOutcome(response.status === 404 ? "not_found" : "unknown");
        return;
      }
      if (data.result === "processing" && attempt < attempts) {
        setTimeout(() => void check(attempt + 1), delayMs);
        return;
      }

      setOutcome(data.result);
      setOrderNumber(data.orderNumber);
      if (data.result === "paid") {
        // The order emptied the cart on the API; the badge in the header catches up
        void refreshCart();
        // What was bought and where it's going, for the confirmation. Without it the page still confirms.
        if (data.orderNumber) {
          const { data: placed } = await api.GET("/api/account/orders/{orderNumber}", { params: { path: { orderNumber: data.orderNumber } } });
          if (!stopped && placed) setOrder(placed);
        }
      }
    };

    void check(1);
    return () => {
      stopped = true;
    };
  }, [paymentIntentId, refreshCart]);

  if (outcome === null) {
    return (
      <Message icon={LoaderCircle} spin title="Confirming your payment…">
        This only takes a moment.
      </Message>
    );
  }

  if (outcome === "paid" && orderNumber) return <Confirmation orderNumber={orderNumber} order={order} supportEmail={supportEmail} />;

  if (outcome === "processing") {
    return (
      <Message icon={Clock} title="Your payment is processing">
        We&apos;ll email you as soon as your order is confirmed. It will also appear in your orders.
        <Actions primary={{ href: "/account/orders", label: "View your orders" }} />
      </Message>
    );
  }

  if (outcome === "refunded") {
    return (
      <Message icon={RotateCcw} tone="warning" title="We couldn't complete your order">
        Something in your bag sold out or changed while you were paying, so your payment has been refunded in full.
        Refunds usually reach your card within 5 to 10 business days.
        <Actions primary={{ href: "/cart", label: "Back to bag" }} />
      </Message>
    );
  }

  if (outcome === "failed") {
    return (
      <Message icon={CircleX} tone="danger" title="Your payment didn't go through">
        You haven&apos;t been charged. Try again, or use another payment method.
        <Actions primary={{ href: "/checkout", label: "Try again" }} />
      </Message>
    );
  }

  return (
    <Message icon={SearchX} title="We couldn't find that payment">
      If you were charged, your order will appear in your orders and you&apos;ll get a confirmation email.
      <Actions primary={{ href: "/account/orders", label: "View your orders" }} />
    </Message>
  );
}

const pill = "inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition-colors";

function Confirmation({ orderNumber, order, supportEmail }: { orderNumber: string; order: Order | null; supportEmail: string | null }) {
  const user = useCurrentUser();
  const steps = [
    { label: "Placed", note: "Just now", done: true },
    { label: "Shipped", note: "We email the tracking number", done: false },
    { label: "Delivered", note: "Expected date once it ships", done: false },
  ];

  return (
    <div className="mx-auto grid max-w-[1120px] gap-4">
      <div role="status" className="relative isolate grid justify-items-center gap-4 pb-8 text-center">
        <span aria-hidden className="absolute -top-10 -z-10 size-72 rounded-full bg-glow-green opacity-[calc(0.22*var(--glow-strength))] blur-[90px]" />
        <span className="grid size-16 place-items-center rounded-full bg-linear-to-br from-glow-green to-glow-blue text-[#052e1f] shadow-[0_0_0_8px_color-mix(in_oklab,var(--glow-green)_15%,transparent),0_20px_60px_color-mix(in_oklab,var(--glow-green)_35%,transparent)]">
          <CircleCheck className="size-8" strokeWidth={2.2} aria-hidden />
        </span>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">Thank you! Your order is confirmed.</h1>
        <p className="text-[17px] text-muted-foreground">
          Order <span className="rounded-md bg-foreground/8 px-1.5 py-0.5 font-mono text-[15px] text-foreground">#{orderNumber}</span>
          {user && <> · A confirmation is on its way to {user.email}.</>}
        </p>
      </div>

      <ol aria-label="Order progress" className="grid gap-5 rounded-[28px] border bg-card px-7 py-6 sm:grid-cols-3 sm:gap-3 sm:px-8 sm:py-7">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                step.done ? "bg-glow-green text-[#052e1f] shadow-[0_0_0_4px_color-mix(in_oklab,var(--glow-green)_18%,transparent)]" : "border-[1.5px] border-input",
              )}
            >
              {step.done && <Check className="size-4" strokeWidth={3} />}
            </span>
            <span className="grid gap-0.5">
              <span className={cn("font-semibold", !step.done && "text-muted-foreground")}>
                {step.label}
                {step.done && <span className="sr-only"> (done)</span>}
              </span>
              <span className="text-[13px] text-muted-foreground">{step.note}</span>
            </span>
          </li>
        ))}
      </ol>

      {order && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section aria-labelledby="coming-heading" className="grid gap-4.5 rounded-[28px] border bg-card p-6 sm:p-7">
            <h2 id="coming-heading" className="font-sans text-lg font-semibold">
              What&apos;s coming
            </h2>
            <OrderLines lines={order.lines} />
            <OrderTotals totals={order} state={order.shipTo.state} totalLabel="Paid" />
          </section>
          <div className="grid gap-4">
            <section aria-labelledby="ship-heading" className="grid gap-2.5 rounded-[24px] border bg-card p-6">
              <h2 id="ship-heading" className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">
                Shipping to
              </h2>
              <p className="text-[15px] leading-relaxed">
                {order.shipTo.recipientName}
                {addressLines(order.shipTo).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </section>
            <section aria-labelledby="help-heading" className="grid gap-2.5 rounded-[24px] border bg-linear-135 from-glow-violet/12 to-card to-70% p-6">
              <h2 id="help-heading" className="font-sans text-base font-semibold">
                Questions about this order?
              </h2>
              <p className="text-sm leading-normal text-muted-foreground">
                Write to us with your order number and a person replies by email
                {supportEmail ? (
                  <>
                    , at <a href={`mailto:${supportEmail}`} className="text-foreground underline underline-offset-3">{supportEmail}</a>.
                  </>
                ) : (
                  "."
                )}
              </p>
              <Link href="/contact" className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-accent hover:underline">
                Contact us
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </section>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Link href={`/account/orders/${orderNumber}`} className={cn(pill, "bg-primary text-primary-foreground hover:bg-primary/85")}>
          Track your order
        </Link>
        <Link href="/products" className={cn(pill, "border border-foreground/16 hover:bg-foreground/5")}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

const tones = {
  neutral: "bg-foreground/6 text-foreground",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-destructive-subtle text-destructive",
};

function Message({ icon: Icon, title, tone = "neutral", spin, children }: { icon: LucideIcon; title: string; tone?: keyof typeof tones; spin?: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-4 text-center" role="status">
      <span className={cn("grid size-16 place-items-center rounded-full", tones[tone])}>
        <Icon className={cn("size-8", spin && "animate-spin")} aria-hidden />
      </span>
      <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.04em] sm:text-[40px]">{title}</h1>
      <div className="grid gap-7 text-[17px] text-muted-foreground">{children}</div>
    </div>
  );
}

function Actions({ primary }: { primary: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link href={primary.href} className={cn(pill, "bg-primary text-primary-foreground hover:bg-primary/85")}>
        {primary.label}
      </Link>
      <Link href="/products" className={cn(pill, "border border-foreground/16 text-foreground hover:bg-foreground/5")}>
        Keep shopping
      </Link>
    </div>
  );
}
