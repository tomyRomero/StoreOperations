"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const addButton =
  "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-70 sm:h-[58px]";

// Adding opens the bag drawer with the item highlighted. On phones the button also follows along at
// the bottom of the screen once the main one scrolls away.
export function ProductPurchase({ product }: { product: Product }) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const mainButton = useRef<HTMLButtonElement>(null);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, 99);
  const label = `Add to bag · ${formatMoney(product.priceCents * quantity)}`;

  useEffect(() => {
    const button = mainButton.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const add = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    setAdding(true);
    const added = await cart.add(product.id, quantity);
    setAdding(false);
    if (added) {
      cart.openCart(product.id, button);
      setQuantity(1);
    }
  };

  if (soldOut) {
    return (
      <button type="button" disabled className={cn(addButton, "w-full cursor-not-allowed bg-foreground/10 text-muted-foreground hover:bg-foreground/10 disabled:opacity-100")}>
        Sold out
      </button>
    );
  }

  return (
    <>
      <div className="flex gap-2.5">
        <QuantityStepper value={quantity} onChange={setQuantity} max={max} label={`Quantity of ${product.name}`} />
        <button
          ref={mainButton}
          type="button"
          onClick={add}
          disabled={adding}
          aria-busy={adding || undefined}
          className={cn(addButton, "grow shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_20px_50px_color-mix(in_oklab,var(--glow)_35%,transparent)]")}
        >
          {adding && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {label}
        </button>
      </div>

      {/* Phones only, and only while the main button is off screen; it repeats that button for thumbs */}
      <div
        aria-hidden={!showBar}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 bg-linear-to-b from-background/0 via-background/92 via-30% to-background/92 px-3 pb-7 pt-3 transition-transform duration-200 lg:hidden",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <button type="button" onClick={add} disabled={adding} tabIndex={showBar ? 0 : -1} className={cn(addButton, "w-full shadow-[0_16px_40px_color-mix(in_oklab,var(--glow)_40%,transparent)]")}>
          {label}
        </button>
      </div>
    </>
  );
}
