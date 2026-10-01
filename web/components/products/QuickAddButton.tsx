"use client";

import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

// The "+" on a product card: adds one, then opens the cart drawer with it highlighted. The cart checks
// stock with the API and says why when it can't add.
export function QuickAddButton({ productId, name, className }: { productId: number; name: string; className?: string }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);

  const add = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    setBusy(true);
    const added = await cart.add(productId);
    setBusy(false);
    if (added) cart.openCart(productId, button);
  };

  return (
    <button
      type="button"
      onClick={add}
      disabled={busy}
      aria-busy={busy || undefined}
      aria-label={`Add ${name} to cart`}
      className={cn(
        "relative z-10 inline-flex size-10 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-colors duration-[120ms] hover:bg-primary hover:text-primary-foreground disabled:opacity-70",
        className
      )}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Plus className="size-5" aria-hidden />}
    </button>
  );
}
