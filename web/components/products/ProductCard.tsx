import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { formatMoney, percentOff } from "@/lib/money";
import { ProductStage } from "./ProductStage";
import { QuickAddButton } from "./QuickAddButton";

type Props = {
  product: Product;
  // From Store settings: at or below it the card says how many are left
  lowStockThreshold: number;
  // For the first row of a list, which is likely the largest image on screen when the page opens
  priority?: boolean;
};

const pill = "inline-flex h-7 items-center rounded-full border border-foreground/14 bg-foreground/10 px-3 font-mono text-xs font-medium backdrop-blur-md";

// The product on its stage, then its name, price and a "+". The whole card opens the product (the name's
// link is stretched over it); the "+" sits on top of it, outside the link, so there's never a button
// inside a link.
export function ProductCard({ product, lowStockThreshold, priority = false }: Props) {
  const soldOut = product.stock <= 0;
  const regular = product.compareAtPriceCents;
  const saving = regular !== null && regular > product.priceCents ? percentOff(product.priceCents, regular) : 0;
  const lowStock = !soldOut && product.stock <= lowStockThreshold;

  return (
    <article className="group relative overflow-hidden rounded-[28px] border bg-card transition-[border-color,translate] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-foreground/22 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring">
      <ProductStage
        productId={product.id}
        imageUrl={product.imageUrl}
        sizes="(min-width: 1280px) 320px, (min-width: 768px) 30vw, 46vw"
        priority={priority}
        dimmed={soldOut}
        className="aspect-[5/6]"
      >
        {(saving > 0 || lowStock) && (
          // The price line and the product page say the same in words
          <span aria-hidden className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {saving > 0 && <span className={`${pill} text-sale`}>−{saving}%</span>}
            {lowStock && <span className={`${pill} text-warning`}>Only {product.stock} left</span>}
          </span>
        )}
      </ProductStage>

      <div className="flex items-center justify-between gap-3 border-t border-foreground/6 px-5 pb-5 pt-4">
        <div className="grid min-w-0 gap-1">
          <h3 className="line-clamp-2 font-sans text-base font-semibold leading-snug">
            <Link href={`/products/${product.id}`} className="outline-none after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm tabular-nums text-muted-foreground">
            {regular !== null && saving > 0 ? (
              <>
                <span className="sr-only">Was {formatMoney(regular)}, now </span>
                {formatMoney(product.priceCents)} <s aria-hidden className="text-faint">{formatMoney(regular)}</s>
              </>
            ) : (
              formatMoney(product.priceCents)
            )}
            {lowStock && <span className="sr-only">. Only {product.stock} left</span>}
          </p>
        </div>
        {soldOut ? (
          <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-foreground/12 px-3 font-mono text-xs font-medium text-muted-foreground">
            Sold out
          </span>
        ) : (
          <QuickAddButton productId={product.id} name={product.name} />
        )}
      </div>
    </article>
  );
}
