import { Badge } from "@/components/ui/badge";
import { formatMoney, percentOff } from "@/lib/money";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-h2 font-display",
};

type Props = {
  priceCents: number;
  // The regular price while the product is on a deal
  compareAtPriceCents?: number | null;
  size?: keyof typeof sizes;
  className?: string;
};

// A price, or a sale price with the regular one struck through and the saving. Screen readers hear
// "Was $44.99, now $34.99" instead of two numbers in a row.
export function PriceTag({ priceCents, compareAtPriceCents, size = "md", className }: Props) {
  const onSale = compareAtPriceCents != null && compareAtPriceCents > priceCents;

  if (!onSale) {
    return <span className={cn("font-bold tabular-nums", sizes[size], className)}>{formatMoney(priceCents)}</span>;
  }

  const saving = percentOff(priceCents, compareAtPriceCents);

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className="sr-only">
        Was {formatMoney(compareAtPriceCents)}, now {formatMoney(priceCents)}
      </span>
      <span aria-hidden className={cn("font-bold tabular-nums text-sale", sizes[size])}>
        {formatMoney(priceCents)}
      </span>
      <s aria-hidden className="text-sm tabular-nums text-muted-foreground">
        {formatMoney(compareAtPriceCents)}
      </s>
      {saving > 0 && (
        <Badge aria-hidden variant="sale" className="self-center">
          −{saving}%
        </Badge>
      )}
    </span>
  );
}
