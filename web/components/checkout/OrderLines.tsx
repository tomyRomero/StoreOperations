import { ProductThumb } from "@/components/products/ProductThumb";
import { formatMoney } from "@/lib/money";
import { stateName } from "@/lib/us-states";

type Line = { productId: number; name: string; quantity: number; lineTotalCents: number; imageUrl: string };

type Totals = { subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number };

// Prices come from the quote or the order, never from the bag
export function OrderLines({ lines }: { lines: Line[] }) {
  return (
    <ul className="grid gap-3.5">
      {lines.map((line) => (
        <li key={line.productId} className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3.5">
          <ProductThumb productId={line.productId} imageUrl={line.imageUrl} sizes="60px" className="size-15 rounded-[14px]" />
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-sm font-semibold">{line.name}</span>
            <span className="text-xs text-muted-foreground">Qty {line.quantity}</span>
          </span>
          <span className="font-mono text-sm font-medium tabular-nums">{formatMoney(line.lineTotalCents)}</span>
        </li>
      ))}
    </ul>
  );
}

type TotalsProps = {
  totals: Totals;
  // The ship-to state, which the tax is for: "Tax (Illinois)"
  state?: string | null;
  // "Total" before paying, "Paid" after
  totalLabel?: string;
};

// Subtotal, shipping, tax and the total, as the API worked them out
export function OrderTotals({ totals, state, totalLabel = "Total" }: TotalsProps) {
  const taxLabel = state ? `Tax (${stateName(state)})` : "Tax";
  return (
    <dl className="grid gap-2.5 border-t border-foreground/8 pt-4 text-sm">
      {(
        [
          ["Subtotal", totals.subtotalCents],
          ["Shipping", totals.shippingCents],
          [taxLabel, totals.taxCents],
        ] as const
      ).map(([label, cents]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-mono tabular-nums">{cents === 0 && label === "Shipping" ? "Free" : formatMoney(cents)}</dd>
        </div>
      ))}
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-foreground/8 pt-3.5">
        <dt className="text-[15px] font-semibold">{totalLabel}</dt>
        <dd className="font-mono text-[24px] font-semibold tabular-nums">{formatMoney(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
