"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/lib/api/types";
import type { ShippingSettings } from "@/lib/cart";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { RemovedNotice } from "./RemovedNotice";
import { ShippingNudges } from "./ShippingNudges";

type Props = {
  shipping: ShippingSettings;
  categories: Category[];
  lowStockThreshold: number;
  guestCheckout: boolean;
};

// The bag as a page, for links to /cart and for coming back after sign-in
export function CartPageContents({ shipping, categories, lowStockThreshold, guestCheckout }: Props) {
  const { cart, itemCount } = useCart();

  return (
    <>
      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
        <div className="flex items-baseline gap-4">
          <h1 className="text-[44px] font-semibold leading-none tracking-[-0.05em] lg:text-[64px]">Your bag</h1>
          {itemCount > 0 && <span className="font-mono text-[15px] text-muted-foreground">{itemCount === 1 ? "1 item" : `${itemCount} items`}</span>}
        </div>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-[15px] text-ink-2 hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          Keep shopping
        </Link>
      </div>

      {!cart ? (
        <div className="grid gap-3" role="status" aria-busy="true" aria-label="Loading your bag">
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </div>
      ) : cart.lines.length === 0 ? (
        <div className="grid gap-4 rounded-[28px] border bg-card">
          <RemovedNotice />
          <EmptyCart categories={categories} />
        </div>
      ) : (
        <>
          <div className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section aria-labelledby="bag-items-heading" className="grid gap-3">
              <h2 id="bag-items-heading" className="sr-only">
                Items
              </h2>
              <FreeShippingMeter settings={shipping} truck />
              <RemovedNotice />
              <ul className="grid gap-3">
                {cart.lines.map((line) => (
                  <CartLineItem key={line.productId} line={line} variant="page" />
                ))}
              </ul>
            </section>
            <section
              aria-labelledby="bag-summary-heading"
              className="rounded-[28px] border bg-linear-to-b from-foreground/[0.045] to-foreground/[0.015] p-7 lg:sticky lg:top-[100px]"
            >
              <h2 id="bag-summary-heading" className="mb-4.5 font-sans text-xl font-semibold tracking-[-0.02em]">
                Summary
              </h2>
              <CartSummary cart={cart} shipping={shipping} guestCheckout={guestCheckout} variant="page" />
            </section>
          </div>
          <ShippingNudges shipping={shipping} variant="page" lowStockThreshold={lowStockThreshold} />
        </>
      )}
    </>
  );
}
