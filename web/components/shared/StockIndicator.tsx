import { stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  stock: number;
  // From Store settings: at or below this, the page says how many are left
  lowStockThreshold: number;
  className?: string;
};

// In stock / Only 3 left / Sold out: words and a colored dot, never color alone
export function StockIndicator({ stock, lowStockThreshold, className }: Props) {
  const tone = stock <= 0 ? "text-sale" : stock <= lowStockThreshold ? "text-warning" : "text-success";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", tone, className)}>
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {stockLabel(stock, lowStockThreshold)}
    </span>
  );
}
