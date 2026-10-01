import Image from "next/image";
import { formatMoney } from "@/lib/money";

type Line = { productId: number; name: string; quantity: number; lineTotalCents: number; imageUrl: string };

type Totals = { subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number };

// What's being bought, at the prices in the quote or the order
export function OrderLines({ lines }: { lines: Line[] }) {
  return (
    <ul className="grid gap-4">
      {lines.map((line) => (
        <li key={line.productId} className="flex items-center gap-3">
          <span className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
            <Image src={line.imageUrl} alt="" fill sizes="56px" className="object-cover" />
            <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-bl-sm bg-primary text-[11px] font-bold text-primary-foreground">
              {line.quantity}
            </span>
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate font-semibold">{line.name}</span>
            <span className="text-muted-foreground">Quantity {line.quantity}</span>
          </span>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(line.lineTotalCents)}</span>
        </li>
      ))}
    </ul>
  );
}

// Subtotal, shipping, tax and the total, as the API worked them out
export function OrderTotals({ totals }: { totals: Totals }) {
  return (
    <dl className="grid gap-2 text-sm">
      {(
        [
          ["Subtotal", totals.subtotalCents],
          ["Shipping", totals.shippingCents],
          ["Tax", totals.taxCents],
        ] as const
      ).map(([label, cents]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="tabular-nums">{cents === 0 && label === "Shipping" ? "Free" : formatMoney(cents)}</dd>
        </div>
      ))}
      <div className="mt-2 flex justify-between gap-4 border-t pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatMoney(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
