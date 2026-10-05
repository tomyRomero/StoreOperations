"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, formatMoneyBrief } from "@/lib/money";

type Props = {
  flatCents: number;
  freeOverCents: number | null;
};

// The store's shipping promise, and when there's a free-shipping threshold, how close the bag is to it
export function ShippingTile({ flatCents, freeOverCents }: Props) {
  const { cart } = useCart();
  const subtotal = cart?.subtotalCents ?? 0;
  const free = flatCents === 0 || freeOverCents === 0;
  const meter = !free && freeOverCents !== null;
  const [headline, aside] = free
    ? ["Free shipping.", "On every order."]
    : freeOverCents === null
      ? [`${formatMoneyBrief(flatCents)} flat.`, "On every order."]
      : [`Free over ${formatMoneyBrief(freeOverCents)}.`, `${formatMoneyBrief(flatCents)} flat otherwise.`];

  return (
    <div className="col-span-2 flex flex-col justify-between gap-3 rounded-[24px] border bg-card px-5 py-4.5 lg:col-span-1 lg:rounded-[28px] lg:p-7">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.06em] text-success max-lg:hidden">Shipping</p>
      <p className="text-[15px] font-semibold lg:text-[30px] lg:leading-[1.05] lg:tracking-[-0.04em]">
        {headline} <span className="text-faint max-lg:sr-only lg:block">{aside}</span>
      </p>
      {meter && (
        <div className="grid gap-2.5">
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-foreground/8">
            <div className="h-full rounded-full bg-linear-to-r from-glow-green to-glow-blue" style={{ width: `${Math.min(100, (subtotal / freeOverCents) * 100)}%` }} />
          </div>
          <p className="font-mono text-xs font-medium text-muted-foreground lg:text-[13px]">
            {subtotal >= freeOverCents
              ? "Your bag ships free"
              : `${formatMoney(subtotal)} / ${formatMoney(freeOverCents)} in your bag`}
          </p>
        </div>
      )}
    </div>
  );
}
