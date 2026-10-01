import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PriceTag } from "@/components/shared/PriceTag";
import { StockIndicator } from "@/components/shared/StockIndicator";
import { ProductRow } from "@/components/home/ProductRow";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import type { Product } from "@/lib/api/types";
import { getProduct, getRelatedProducts, getStoreSettings } from "@/lib/data/catalog";
import { returnsSummary, shippingSummary } from "@/lib/format";
import { siteUrl } from "@/lib/site";

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

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so a product name can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <div className="container grid gap-8 py-8 lg:grid-cols-2 lg:gap-14 lg:py-12">
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted sm:aspect-[4/5] lg:sticky lg:top-28 lg:self-start">
          <Image src={product.imageUrl} alt={product.name} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
        </div>

        <div className="grid content-start gap-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: product.categoryName, href: `/products?category=${product.categoryId}` },
              { label: product.name },
            ]}
          />

          <div className="grid gap-3">
            <h1 className="text-h1">{product.name}</h1>
            <PriceTag priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} size="lg" />
            {product.dealDescription && <p className="text-sm font-semibold text-sale">{product.dealDescription}</p>}
            <StockIndicator stock={product.stock} lowStockThreshold={lowStockThreshold} />
          </div>

          <p className="text-body-lg text-muted-foreground">{product.description}</p>

          <ProductPurchase product={product} />

          <h2 className="sr-only">More about this product</h2>
          <Accordion type="multiple" defaultValue={["details"]} className="border-t">
            <AccordionItem value="details">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  <dt className="font-semibold text-foreground">Category</dt>
                  <dd>{product.categoryName}</dd>
                  <dt className="font-semibold text-foreground">Item number</dt>
                  <dd className="tabular-nums">{String(product.id).padStart(5, "0")}</dd>
                </dl>
              </AccordionContent>
            </AccordionItem>
            {settings && (
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping and returns</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-2">
                    <li>{shippingSummary(settings)}, anywhere in the United States.</li>
                    <li>
                      {returnsSummary(settings)}.{settings.returnPolicyNote ? ` ${settings.returnPolicyNote}` : ""}
                    </li>
                    <li>Tax is added at checkout, once we know where it&apos;s going.</li>
                    <li>
                      <Link href="/shipping-returns" className="font-semibold text-accent underline-offset-4 hover:underline">
                        Shipping and returns in full
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      <Suspense>
        <RelatedProducts product={product} lowStockThreshold={lowStockThreshold} />
      </Suspense>
      {/* Room for the phone's add-to-cart bar, so it never covers the end of the page */}
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}

async function RelatedProducts({ product, lowStockThreshold }: { product: Product; lowStockThreshold: number }) {
  const related = await getRelatedProducts(product.id);
  return (
    <ProductRow
      id="related"
      title="You may also like"
      href={`/products?category=${product.categoryId}`}
      linkLabel={`More ${product.categoryName.toLowerCase()}`}
      products={related}
      lowStockThreshold={lowStockThreshold}
    />
  );
}
