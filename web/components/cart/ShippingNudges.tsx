"use client";

import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductThumb } from "@/components/products/ProductThumb";
import { QuickAddButton } from "@/components/products/QuickAddButton";
import { toFreeShipping, type ShippingSettings } from "@/lib/cart";
import { formatMoney, formatMoneyBrief } from "@/lib/money";
import { useCart } from "./CartProvider";
import { useShippingNudges } from "./use-shipping-nudges";

type Props = {
  shipping: ShippingSettings;
  // Two small tiles in the drawer, or a row of cards under the bag page
  variant: "drawer" | "page";
  lowStockThreshold?: number;
  onNavigate?: () => void;
};

// Any one of these would take the bag past free shipping. Shown only while the bag is short of it.
export function ShippingNudges({ shipping, variant, lowStockThreshold = 5, onNavigate }: Props) {
  const { cart } = useCart();
  const missing = toFreeShipping(cart?.subtotalCents ?? 0, shipping);
  const inBag = cart?.lines.map((line) => line.productId) ?? [];
  const products = useShippingNudges(missing || null, inBag, variant === "drawer" ? 2 : 4);
  if (products.length === 0 || !shipping?.freeShippingThresholdCents) return null;

  if (variant === "drawer") {
    return (
      <section aria-labelledby="nudges-heading" className="grid gap-2.5 rounded-[18px] border border-foreground/7 bg-foreground/3 p-3.5">
        <h3 id="nudges-heading" className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-faint">
          Gets you free shipping
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="relative flex items-center gap-2.5 rounded-[14px] bg-muted p-2">
              <ProductThumb productId={product.id} imageUrl={product.imageUrl} sizes="40px" className="size-10 rounded-[10px] bg-surface-3" />
              <span className="grid min-w-0 grow">
                <Link href={`/products/${product.id}`} onClick={onNavigate} className="truncate text-[13px] font-semibold after:absolute after:inset-0">
                  {product.name}
                </Link>
                <span className="font-mono text-xs text-muted-foreground">{formatMoney(product.priceCents)}</span>
              </span>
              <QuickAddButton productId={product.id} name={product.name} className="size-8" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section aria-labelledby="nudges-heading" className="pt-20 lg:pt-30">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 lg:mb-8">
        <h2 id="nudges-heading" className="text-[32px] font-semibold leading-none tracking-[-0.045em] lg:text-[40px]">
          Add one, ship free
        </h2>
        <p className="text-[15px] text-muted-foreground">Any of these gets you past {formatMoneyBrief(shipping.freeShippingThresholdCents)}</p>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} lowStockThreshold={lowStockThreshold} />
          </li>
        ))}
      </ul>
    </section>
  );
}
