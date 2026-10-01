"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/lib/api/types";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary, type ShippingSettings } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { RemovedNotice } from "./RemovedNotice";

// The same cart as the drawer, full width, for links to /cart and returning after sign-in
export function CartPageContents({ shipping, categories }: { shipping: ShippingSettings; categories: Category[] }) {
  const { cart } = useCart();

  if (!cart) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Loading your cart">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="grid gap-4">
        <RemovedNotice />
        <EmptyCart categories={categories} />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" className="sr-only">
          Items
        </h2>
        <div className="has-[p]:mb-3">
          <RemovedNotice />
        </div>
        <ul className="grid gap-2 divide-y rounded-md border p-2">
          {cart.lines.map((line) => (
            <CartLineItem key={line.productId} line={line} />
          ))}
        </ul>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </section>
      <section aria-labelledby="cart-summary-heading" className="rounded-md border p-5 lg:sticky lg:top-28">
        <h2 id="cart-summary-heading" className="mb-4 text-h3">
          Summary
        </h2>
        <CartSummary cart={cart} shipping={shipping} />
      </section>
    </div>
  );
}
