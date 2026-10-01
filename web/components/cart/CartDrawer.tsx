"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Category } from "@/lib/api/types";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary, type ShippingSettings } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { RemovedNotice } from "./RemovedNotice";

// The cart in a drawer from the right, full width on phones. Radix keeps focus inside, Esc closes it,
// and focus goes back to the button that opened it (an add button says which, see openCart).
export function CartDrawer({ shipping, categories }: { shipping: ShippingSettings; categories: Category[] }) {
  const { cart, itemCount, isOpen, justAdded, closeCart, openCart, openedFrom } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent
        side="right"
        onCloseAutoFocus={(event) => {
          const opener = openedFrom.current;
          if (!opener?.isConnected) return;
          event.preventDefault();
          opener.focus({ preventScroll: true });
        }}
      >
        <SheetHeader>
          <SheetTitle>Your cart{itemCount > 0 && ` (${itemCount})`}</SheetTitle>
          <SheetDescription className="sr-only">The items in your cart, their quantities and the way to checkout.</SheetDescription>
        </SheetHeader>

        {!cart ? (
          <div className="grid gap-4 p-5" aria-busy="true" aria-label="Loading your cart">
            {[0, 1].map((n) => (
              <div key={n} className="flex gap-4">
                <Skeleton className="aspect-[4/5] w-20" />
                <div className="grid flex-1 content-start gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-4 p-3">
            <RemovedNotice />
            <EmptyCart categories={categories} onNavigate={closeCart} />
          </div>
        ) : (
          <>
            <div className="px-3 has-[p]:pt-3">
              <RemovedNotice />
            </div>
            <ul className="grid flex-1 content-start gap-2 overflow-y-auto p-3">
              {cart.lines.map((line) => (
                <CartLineItem key={line.productId} line={line} highlighted={line.productId === justAdded} onNavigate={closeCart} />
              ))}
            </ul>
            <SheetFooter>
              <CartSummary cart={cart} shipping={shipping} onNavigate={closeCart} />
              <Link href="/cart" onClick={closeCart} className="justify-self-center text-sm font-semibold underline-offset-4 hover:underline">
                View cart page
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
