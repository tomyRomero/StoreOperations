"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import OrderSuccess from "../cards/OrderSuccess";
import { useCart } from "../cart/CartProvider";
import { api } from "@/lib/api/browser";
import type { PaymentResult } from "@/lib/api/types";

type Outcome = PaymentResult | "not_found" | "unknown";

// Stripe tells the API about a payment through a webhook, usually within a second or two of the
// customer arriving here. Until the order exists the answer is "processing", so this asks again
// for a little while before saying it's still working on it.
const attempts = 20;
const delayMs = 1500;

const OrderResult = ({ paymentIntentId, supportEmail }: { paymentIntentId: string; supportEmail: string | null }) => {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
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
      // The order emptied the cart on the API; the badge in the nav catches up
      if (data.result === "paid") void refreshCart();
    };

    void check(1);
    return () => {
      stopped = true;
    };
  }, [paymentIntentId, refreshCart]);

  if (outcome === null) {
    return (
      <Message title="Confirming your payment..." icon="/assets/lineloader.svg">
        This only takes a moment.
      </Message>
    );
  }

  if (outcome === "paid" && orderNumber) return <OrderSuccess orderNumber={orderNumber} supportEmail={supportEmail} />;

  if (outcome === "processing") {
    return (
      <Message title="Your payment is processing">
        We&apos;ll email you as soon as your order is confirmed. It will also appear in your orders.
        <Actions primary={{ href: "/account/orders", label: "View Orders" }} />
      </Message>
    );
  }

  if (outcome === "refunded") {
    return (
      <Message title="We couldn't complete your order">
        Something in your cart sold out or changed while you were paying, so your payment has been refunded in full.
        Refunds usually reach your card within 5-10 business days.
        <Actions primary={{ href: "/cart", label: "Back to Cart" }} />
      </Message>
    );
  }

  if (outcome === "failed") {
    return (
      <Message title="Your payment didn't go through">
        You haven&apos;t been charged. Try again, or use another payment method.
        <Actions primary={{ href: "/checkout", label: "Try Again" }} />
      </Message>
    );
  }

  return (
    <Message title="We couldn't find that payment">
        If you were charged, your order will appear in your orders and you&apos;ll get a confirmation email.
        <Actions primary={{ href: "/account/orders", label: "View Orders" }} />
    </Message>
  );
};

function Message({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl p-6 bg-white rounded-lg shadow-md text-center grid gap-4" role="status">
      {icon && <Image src={icon} alt="" width={64} height={64} className="mx-auto" />}
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="text-gray-600 grid gap-4">{children}</div>
    </div>
  );
}

function Actions({ primary }: { primary: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Button asChild className="bg-black text-white border border-black" variant="ghost">
        <Link href={primary.href}>{primary.label}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}

export default OrderResult;
