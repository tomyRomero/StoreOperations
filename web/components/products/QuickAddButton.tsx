"use client";

import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

// The "+" on a product card: adds one, then opens the bag drawer with it highlighted. The cart checks
// stock with the API and says why when it can't add.
type Props = {
  productId: number;
  name: string;
  className?: string;
  // In place of the "+", such as the word Add
  children?: React.ReactNode;
};

export function QuickAddButton({ productId, name, className, children }: Props) {
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
      aria-label={`Add ${name} to bag`}
      className={cn(
        "relative z-10 inline-flex size-[42px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[background-color,scale] duration-[120ms] hover:bg-primary/85 active:scale-95 disabled:opacity-70",
        className
      )}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : (children ?? <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden />)}
    </button>
  );
}
