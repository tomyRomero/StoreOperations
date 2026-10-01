"use client";

import { formatMoney, formatMoneyBrief } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

type Props = {
  flatCents: number;
  freeOverCents: number | null;
  className?: string;
};

// How far the bag is from free shipping, with a bar. Nothing when the store has no threshold or ships
// everything free.
export function FreeShippingMeter({ flatCents, freeOverCents, className }: Props) {
  const { cart } = useCart();
  if (freeOverCents === null || freeOverCents === 0 || flatCents === 0) return null;

  const subtotal = cart?.subtotalCents ?? 0;
  const reached = subtotal >= freeOverCents;

  return (
    <div className={cn("grid gap-2.5 rounded-[20px] border border-foreground/7 bg-foreground/3 px-5 py-4.5", className)}>
      <p className="flex justify-between gap-4 text-sm">
        <span>{reached ? "Your bag ships free" : `Free shipping at ${formatMoneyBrief(freeOverCents)}`}</span>
        {!reached && <span className="font-mono text-muted-foreground">{formatMoney(freeOverCents - subtotal)} to go</span>}
      </p>
      <div aria-hidden className="h-2 overflow-hidden rounded-full bg-foreground/8">
        <div className="h-full rounded-full bg-linear-to-r from-glow-green to-glow-blue" style={{ width: `${Math.min(100, (subtotal / freeOverCents) * 100)}%` }} />
      </div>
    </div>
  );
}
