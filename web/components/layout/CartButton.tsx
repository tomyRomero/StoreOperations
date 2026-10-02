"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

// The item count is announced when it changes
export function CartButton() {
  const { canShop, itemCount, openCart } = useCart();
  const label = itemCount === 1 ? "Bag, 1 item" : `Bag, ${itemCount} items`;

  if (!canShop) return null;

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => openCart()}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full transition-colors duration-[120ms]",
          "max-lg:size-11 max-lg:hover:bg-foreground/5",
          "lg:h-10 lg:gap-2.5 lg:bg-primary lg:pl-4 lg:text-sm lg:font-semibold lg:text-primary-foreground lg:hover:bg-primary/85",
          itemCount > 0 ? "lg:pr-1.5" : "lg:pr-4",
        )}
      >
        <ShoppingBag className="size-5 lg:hidden" aria-hidden />
        <span className="max-lg:hidden">Bag</span>
        {itemCount > 0 && (
          // Keyed by the count, so the badge pops each time it changes
          <span
            key={itemCount}
            className={cn(
              "inline-flex items-center justify-center rounded-full font-bold tabular-nums animate-in zoom-in-75 duration-200",
              "max-lg:absolute max-lg:right-1 max-lg:top-1.5 max-lg:h-[18px] max-lg:min-w-[18px] max-lg:bg-primary max-lg:px-1 max-lg:text-[11px] max-lg:text-primary-foreground",
              "lg:h-7 lg:min-w-7 lg:bg-background lg:px-1.5 lg:text-xs lg:text-foreground",
            )}
          >
            {itemCount}
          </span>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {itemCount > 0 ? `${label.replace("Bag, ", "")} in your bag` : ""}
      </span>
    </>
  );
}
