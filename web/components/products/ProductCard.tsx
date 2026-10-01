import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/shared/PriceTag";
import { StockIndicator } from "@/components/shared/StockIndicator";
import type { Product } from "@/lib/api/types";
import { QuickAddButton } from "./QuickAddButton";

type Props = {
  product: Product;
  // From Store settings: at or below it the card says how many are left
  lowStockThreshold: number;
  // For the first row of a list, which is likely the largest image on screen when the page opens
  priority?: boolean;
};

// The whole card opens the product (the name's link is stretched over it); the "+" button sits on top
// of it, outside the link, so there's never a button inside a link.
export function ProductCard({ product, lowStockThreshold, priority = false }: Props) {
  const soldOut = product.stock <= 0;
  const onSale = product.compareAtPriceCents !== null;

  return (
    <article className="group relative flex flex-col gap-3 rounded-md has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
        {/* The name follows straight after, so the picture doesn't repeat it to screen readers */}
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 46vw"
          priority={priority}
          className={`object-cover transition duration-200 group-hover:brightness-95 ${soldOut ? "opacity-60" : ""}`}
        />
        {soldOut ? (
          <Badge className="absolute left-2 top-2">Sold out</Badge>
        ) : (
          onSale && (
            <Badge variant="sale" className="absolute left-2 top-2">
              Sale
            </Badge>
          )
        )}
        {!soldOut && <QuickAddButton productId={product.id} name={product.name} className="absolute bottom-2 right-2" />}
      </div>

      <div className="grid gap-1">
        <p className="text-xs font-semibold text-muted-foreground">{product.categoryName}</p>
        <h3 className="font-sans text-base font-semibold leading-snug">
          <Link href={`/products/${product.id}`} className="outline-none after:absolute after:inset-0 hover:underline">
            {product.name}
          </Link>
        </h3>
        <PriceTag priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} size="sm" />
        {product.stock > 0 && product.stock <= lowStockThreshold && (
          <StockIndicator stock={product.stock} lowStockThreshold={lowStockThreshold} className="text-xs" />
        )}
      </div>
    </article>
  );
}
