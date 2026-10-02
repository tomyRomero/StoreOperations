"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useCart } from "../cart/CartProvider";
import { OrderLines } from "./OrderLines";
import { shippingFor, type ShippingSettings } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

type Props = {
  shipping: ShippingSettings;
  // Beside the step on large screens; folded under the heading on phones, like the payment step's, with the
  // amount so far on show
  variant?: "aside" | "folded";
};

// The order on the shipping step, as the bag has it. Tax waits for the address.
export function CheckoutBagSummary({ shipping, variant = "aside" }: Props) {
  const { cart } = useCart();
  const shippingCents = cart ? shippingFor(cart.subtotalCents, shipping) : null;

  const edit = (
    <Link href="/cart" className="text-[13px] text-muted-foreground underline underline-offset-3 hover:text-foreground">
      Edit<span className="sr-only"> your bag</span>
    </Link>
  );

  const body = !cart ? (
        <div className="grid gap-3" role="status" aria-busy="true" aria-label="Loading your order">
          <Skeleton className="h-15" />
          <Skeleton className="h-15" />
        </div>
      ) : (
        <>
          <OrderLines lines={cart.lines.map((line) => ({ ...line }))} />
          <dl className="grid gap-2.5 border-t border-foreground/8 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono tabular-nums">{formatMoney(cart.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-mono tabular-nums">{shippingCents === null ? "Next step" : shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-muted-foreground">Next step</dd>
            </div>
          </dl>
        </>
      );

  if (variant === "folded") {
    return (
      <details className="group rounded-[20px] border bg-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4.5 font-semibold [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            Your order
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </span>
          {cart && (
            <span className="font-mono tabular-nums">
              {formatMoney(cart.subtotalCents + (shippingCents ?? 0))}
              <span className="sr-only"> before tax</span>
            </span>
          )}
        </summary>
        <div className="grid gap-4.5 border-t border-foreground/8 p-4.5">
          <div className="justify-self-end">{edit}</div>
          {body}
        </div>
      </details>
    );
  }

  return (
    <aside aria-labelledby="order-heading" className="grid gap-4.5 rounded-[28px] border bg-card p-6.5 max-lg:hidden lg:sticky lg:top-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="order-heading" className="font-sans text-lg font-semibold">
          Your order
        </h2>
        {edit}
      </div>
      {body}
    </aside>
  );
}
