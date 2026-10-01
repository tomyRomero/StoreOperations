"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";

// Opens the cart drawer, with how many items are in the cart. The count is announced when it changes.
export function CartButton() {
  const { itemCount, openCart } = useCart();
  const label = itemCount === 1 ? "Cart, 1 item" : `Cart, ${itemCount} items`;

  return (
    <>
      <Button variant="ghost" className="relative px-2 sm:px-3" aria-label={label} aria-haspopup="dialog" onClick={() => openCart()}>
        <ShoppingBag aria-hidden />
        <span className="max-sm:sr-only">Cart</span>
        {itemCount > 0 && (
          // Keyed by the count, so the badge pops each time it changes
          <span
            key={itemCount}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold tabular-nums text-accent-foreground animate-in zoom-in-75 duration-200 max-sm:absolute max-sm:-right-0.5 max-sm:-top-0.5"
          >
            {itemCount}
          </span>
        )}
      </Button>
      <span className="sr-only" aria-live="polite">
        {itemCount > 0 ? `${label.replace("Cart, ", "")} in your cart` : ""}
      </span>
    </>
  );
}
