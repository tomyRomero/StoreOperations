"use client";

import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { Category } from "@/lib/api/types";
import type { ShippingSettings } from "@/lib/cart";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { RemovedNotice } from "./RemovedNotice";
import { ShippingNudges } from "./ShippingNudges";

// The bag in a drawer from the right, full width on phones: what was just added, how close it is to free
// shipping, the lines, what would ship it free, and the totals with the way to checkout. Radix keeps focus
// inside, Esc closes it, and focus goes back to the button that opened it (an add button says which, see
// openCart).
export function CartDrawer({ shipping, categories }: { shipping: ShippingSettings; categories: Category[] }) {
  const { cart, itemCount, isOpen, justAdded, closeCart, openCart, openedFrom } = useCart();
  const added = justAdded !== null ? cart?.lines.find((line) => line.productId === justAdded) : undefined;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-foreground/10 shadow-[-40px_0_100px_var(--shadow)] sm:max-w-[480px] sm:rounded-none"
        onCloseAutoFocus={(event) => {
          const opener = openedFrom.current;
          if (!opener?.isConnected) return;
          event.preventDefault();
          opener.focus({ preventScroll: true });
        }}
      >
        <div className="flex h-[76px] shrink-0 items-center px-6 pr-16">
          <SheetTitle className="flex items-center gap-2.5 font-sans text-[22px] font-semibold tracking-[-0.03em]">
            Your bag
            {itemCount > 0 && (
              <span key={itemCount} className="inline-grid h-[26px] min-w-[26px] place-items-center rounded-full bg-foreground/10 px-2 font-mono text-[13px] font-medium animate-in zoom-in-75">
                {itemCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">The items in your bag, their quantities and the way to checkout.</SheetDescription>
        </div>

        {!cart ? (
          <div className="grid gap-4 p-6" aria-busy="true" aria-label="Loading your bag">
            {[0, 1].map((n) => (
              <div key={n} className="flex gap-4">
                <Skeleton className="size-21 rounded-[18px]" />
                <div className="grid flex-1 content-start gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-4 px-6">
            <RemovedNotice />
            <EmptyCart categories={categories} onNavigate={closeCart} />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
              <div role="status">
                {added && (
                  <p className="flex items-center gap-2.5 rounded-[14px] border border-glow-green/25 bg-success-subtle px-3.5 py-3 text-sm text-success">
                    <Check className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                    Added {added.name} to your bag
                  </p>
                )}
              </div>
              <FreeShippingMeter settings={shipping} variant="plain" />
              <RemovedNotice />
              <ul>
                {cart.lines.map((line) => (
                  <CartLineItem key={line.productId} line={line} highlighted={line.productId === justAdded} onNavigate={closeCart} />
                ))}
              </ul>
              <ShippingNudges shipping={shipping} variant="drawer" onNavigate={closeCart} />
            </div>
            <div className="shrink-0 border-t border-foreground/8 bg-surface-sunk px-6 pb-6 pt-5">
              <CartSummary cart={cart} shipping={shipping} onNavigate={closeCart} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
