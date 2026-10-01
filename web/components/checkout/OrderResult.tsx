"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleX, Clock, LoaderCircle, RotateCcw, SearchX, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
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

const OrderResult = ({ paymentIntentId, supportEmail }: { paymentIntentId: string; supportEmail: string | null }) => {
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
        Something in your cart sold out or changed while you were paying, so your payment has been refunded in full.
        Refunds usually reach your card within 5 to 10 business days.
        <Actions primary={{ href: "/cart", label: "Back to cart" }} />
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
};

function Confirmation({ orderNumber, order, supportEmail }: { orderNumber: string; order: Order | null; supportEmail: string | null }) {
  const user = useCurrentUser();

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <div role="status" className="grid justify-items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-subtle">
          <CircleCheck className="size-7 text-success" aria-hidden />
        </span>
        <h1 className="text-h1">Thank you! Your order is confirmed.</h1>
        <p className="text-muted-foreground">
          Order <span className="font-semibold text-foreground">#{orderNumber}</span>
          {user && <> · A confirmation is on its way to {user.email}.</>}
        </p>
      </div>

      {order && (
        <div className="grid gap-6 rounded-md border p-5 sm:p-6">
          <OrderLines lines={order.lines} />
          <OrderTotals totals={order} />
          <div className="grid gap-1 border-t pt-5 text-sm">
            <h2 className="font-sans text-sm font-semibold text-muted-foreground">Shipping to</h2>
            <p className="font-semibold">{order.shipTo.recipientName}</p>
            {addressLines(order.shipTo).map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-2 text-muted-foreground">We&apos;ll email you a tracking link when it ships.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={`/account/orders/${orderNumber}`}>Track your order</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
      {supportEmail && (
        <p className="text-center text-sm text-muted-foreground">
          Questions about your order? Write to{" "}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-accent underline-offset-4 hover:underline">
            {supportEmail}
          </a>
          .
        </p>
      )}
    </div>
  );
}

const tones = {
  neutral: "bg-muted text-foreground",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-destructive-subtle text-destructive",
};

function Message({ icon: Icon, title, tone = "neutral", spin, children }: { icon: LucideIcon; title: string; tone?: keyof typeof tones; spin?: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-xl justify-items-center gap-3 text-center" role="status">
      <span className={cn("flex size-14 items-center justify-center rounded-full", tones[tone])}>
        <Icon className={cn("size-7", spin && "animate-spin")} aria-hidden />
      </span>
      <h1 className="text-h2">{title}</h1>
      <div className="grid gap-6 text-muted-foreground">{children}</div>
    </div>
  );
}

function Actions({ primary }: { primary: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button asChild>
        <Link href={primary.href}>{primary.label}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}

export default OrderResult;
