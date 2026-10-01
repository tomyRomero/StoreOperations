"use client";

import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { useCart } from "../cart/CartProvider";
import { OrderLines } from "./OrderLines";
import { shippingFor, type ShippingSettings } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

// The order beside the shipping step, as the bag has it. Tax waits for the address.
export function CheckoutBagSummary({ shipping }: { shipping: ShippingSettings }) {
  const { cart } = useCart();
  const shippingCents = cart ? shippingFor(cart.subtotalCents, shipping) : null;

  return (
    <aside aria-labelledby="order-heading" className="grid gap-4.5 rounded-[28px] border bg-card p-6.5 lg:sticky lg:top-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="order-heading" className="font-sans text-lg font-semibold">
          Your order
        </h2>
        <Link href="/cart" className="text-[13px] text-muted-foreground underline underline-offset-3 hover:text-foreground">
          Edit<span className="sr-only"> your bag</span>
        </Link>
      </div>
      {!cart ? (
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
      )}
    </aside>
  );
}
