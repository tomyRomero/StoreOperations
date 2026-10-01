import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProductRow } from "@/components/home/ProductRow";
import { FreeShippingMeter } from "@/components/cart/FreeShippingMeter";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import { ProductShowcase } from "@/components/products/ProductShowcase";
import type { Product, StoreSettings } from "@/lib/api/types";
import { getProduct, getRelatedProducts, getStoreSettings } from "@/lib/data/catalog";
import { glowFor } from "@/lib/glow";
import { formatMoney, formatMoneyBrief } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

// Null for anything that isn't a product in the store, archived ones included
async function productFor(props: Props): Promise<Product | null> {
  const id = Number((await props.params).id);
  return Number.isInteger(id) && id > 0 ? getProduct(id) : null;
}

// The tab title, the search snippet and the link preview's picture
export async function generateMetadata(props: Props): Promise<Metadata> {
  const product = await productFor(props);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [{ url: product.imageUrl, alt: product.name }] },
  };
}

// No loading.tsx here on purpose: the page waits for the product, so an old link gets a real 404 status
// instead of a streamed 200. Related products stream in below, so they never hold the page up.
export default async function ProductPage(props: Props) {
  const [product, settings] = await Promise.all([productFor(props), getStoreSettings()]);
  if (!product) notFound();

  const lowStockThreshold = settings?.lowStockThreshold ?? 5;
  const productUrl = new URL(`/products/${product.id}`, siteUrl).href;

  // What search engines show next to the result: the price and whether it's in stock
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: new URL(product.imageUrl, siteUrl).href,
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const regular = product.compareAtPriceCents;
  const onSale = regular !== null && regular > product.priceCents;
  const lowStock = product.stock > 0 && product.stock <= lowStockThreshold;
  const facts = settings ? storeFacts(settings) : [];

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so a product name can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <div style={{ "--glow": glowFor(product.id) } as React.CSSProperties}>
        <Breadcrumbs
          className="container py-5.5"
          items={[
            { label: "Shop", href: "/products" },
            { label: product.categoryName, href: `/products?category=${product.categoryId}` },
            { label: product.name },
          ]}
        />

        <div className="container grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
          <ProductShowcase productId={product.id} name={product.name} imageUrl={product.imageUrl} />

          <div className="grid gap-6.5 lg:sticky lg:top-[100px] lg:rounded-[32px] lg:border lg:bg-linear-to-b lg:from-foreground/4 lg:to-foreground/[0.015] lg:p-10">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/products?category=${product.categoryId}`}
                className="inline-flex h-[30px] items-center rounded-full border border-foreground/12 px-3 font-mono text-xs font-medium text-ink-2 transition-colors hover:border-foreground/30"
              >
                {product.categoryName}
              </Link>
              {product.dealDescription && (
                <span className="inline-flex h-[30px] items-center rounded-full border border-glow-pink/40 bg-linear-to-r from-glow-pink/25 to-glow-violet/25 px-3 font-mono text-xs font-medium text-sale">
                  {product.dealDescription}
                </span>
              )}
            </div>

            <div className="grid gap-3.5">
              <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-[64px]">{product.name}</h1>
              <p className="flex flex-wrap items-baseline gap-3">
                {onSale && <span className="sr-only">Was {formatMoney(regular)}, now </span>}
                <span className="text-[32px] font-semibold tabular-nums tracking-[-0.03em]">{formatMoney(product.priceCents)}</span>
                {onSale && (
                  <>
                    <s aria-hidden className="text-lg tabular-nums text-faint">
                      {formatMoney(regular)}
                    </s>
                    <span className="inline-flex h-[26px] items-center self-center rounded-full bg-success-subtle px-2.5 font-mono text-xs font-medium text-success">
                      Save {formatMoney(regular - product.priceCents)}
                    </span>
                  </>
                )}
              </p>
            </div>

            <p className="text-[17px] leading-relaxed text-muted-foreground">{product.description}</p>

            <p className="flex items-center gap-2.5 font-mono text-[13px] font-medium text-ink-2">
              <span
                aria-hidden
                className={cn("size-2 rounded-full", product.stock <= 0 ? "bg-destructive" : lowStock ? "bg-glow-amber" : "bg-glow-green animate-ring")}
              />
              {product.stock <= 0 ? "Sold out for now" : lowStock ? `Only ${product.stock} left` : `${product.stock} in stock · ready to ship`}
            </p>

            <ProductPurchase product={product} />

            {settings && <FreeShippingMeter flatCents={settings.shippingFlatRateCents} freeOverCents={settings.freeShippingThresholdCents} />}

            {facts.length > 0 && (
              <div className="grid gap-3">
                <dl className={cn("grid gap-2.5", facts.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
                  {facts.map(([term, value]) => (
                    <div key={term} className="flex flex-col-reverse gap-1.5 rounded-2xl border border-foreground/7 bg-foreground/3 p-4">
                      <dt className="font-mono text-xs text-faint">{term}</dt>
                      <dd className="text-[15px] font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-[13px] text-muted-foreground">
                  Tax is added at checkout.{" "}
                  <Link href="/shipping-returns" className="text-foreground underline underline-offset-3">
                    Shipping and returns in full
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <Suspense>
          <RelatedProducts product={product} lowStockThreshold={lowStockThreshold} />
        </Suspense>
      </div>
      {/* Room for the phone's add-to-bag bar, so it never covers the end of the page */}
      <div aria-hidden className="h-24 lg:hidden" />
    </>
  );
}

// Shipping, the free-shipping threshold and returns, in a word or two each, from Store settings
function storeFacts(settings: StoreSettings): [string, string][] {
  const flat = settings.shippingFlatRateCents;
  const free = settings.freeShippingThresholdCents;
  const days = settings.returnWindowDays;
  const returns = { no_returns: "Final sale", exchanges: days ? `${days}-day exchanges` : "Exchanges", refunds: days ? `${days}-day refunds` : "Refunds" }[settings.returnPolicy];
  return [
    ["Shipping", flat === 0 || free === 0 ? "Free" : `${formatMoneyBrief(flat)} flat`],
    ...(free !== null && free > 0 && flat > 0 ? [["Free over", formatMoney(free)] as [string, string]] : []),
    ["Returns", returns],
  ];
}

async function RelatedProducts({ product, lowStockThreshold }: { product: Product; lowStockThreshold: number }) {
  const related = await getRelatedProducts(product.id);
  return (
    <ProductRow
      id="related"
      title={`More ${product.categoryName.toLowerCase()}`}
      href={`/products?category=${product.categoryId}`}
      products={related}
      lowStockThreshold={lowStockThreshold}
    />
  );
}
