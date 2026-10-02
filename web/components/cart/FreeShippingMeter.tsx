"use client";

import { Truck } from "lucide-react";
import { toFreeShipping, type ShippingSettings } from "@/lib/cart";
import { formatMoney, formatMoneyBrief } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

type Props = {
  settings: ShippingSettings;
  // A framed panel, optionally with a truck, or just the line and bar (the bag drawer)
  variant?: "panel" | "plain";
  truck?: boolean;
  className?: string;
};

// How far the bag is from free shipping. Nothing when the store has no threshold or ships everything free.
export function FreeShippingMeter({ settings, variant = "panel", truck = false, className }: Props) {
  const { cart } = useCart();
  const subtotal = cart?.subtotalCents ?? 0;
  const gap = toFreeShipping(subtotal, settings);
  const threshold = settings?.freeShippingThresholdCents;
  if (gap === null || !threshold) return null;

  return (
    <div className={cn("flex items-center gap-4.5", variant === "panel" && "rounded-[20px] border border-foreground/8 bg-foreground/[0.025] px-5.5 py-4.5", className)}>
      {truck && (
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-success-subtle text-success">
          <Truck className="size-[22px]" />
        </span>
      )}
      <div className="grid grow gap-2.5">
        <p className="flex justify-between gap-4 text-sm sm:text-[15px]">
          <span>
            {gap === 0 ? (
              <>
                <b className="font-semibold">Free shipping</b> on this bag
              </>
            ) : (
              <>
                Add <b className="font-semibold">{formatMoney(gap)}</b> more and shipping is free
              </>
            )}
          </span>
          <span className="font-mono text-xs text-faint">{formatMoneyBrief(threshold)}</span>
        </p>
        <div aria-hidden className="h-2 overflow-hidden rounded-full bg-foreground/8">
          <div
            className="h-full rounded-full bg-linear-to-r from-glow-green to-glow-blue transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
