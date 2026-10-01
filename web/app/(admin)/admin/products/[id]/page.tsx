import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArchiveButton } from "@/components/admin/products/ArchiveButton";
import { DealForm } from "@/components/admin/products/DealForm";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminCategories, getAdminProduct } from "@/lib/data/admin-catalog";
import { getAdminSettings } from "@/lib/data/admin-store";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function productFor(props: Props) {
  const id = Number((await props.params).id);
  return Number.isInteger(id) && id > 0 ? getAdminProduct(id) : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const product = await productFor(props);
  return { title: product?.name ?? "Product" };
}

const card = "rounded-xl border bg-card p-5 sm:p-6";

// One product: its details on the left, its deal on the right, and archiving at the top
export default async function AdminProductPage(props: Props) {
  const [product, categories, settings] = await Promise.all([productFor(props), getAdminCategories(), getAdminSettings()]);
  if (!product || !categories || !settings) notFound();

  const archived = product.archivedAtUtc !== null;

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/products", label: "All products" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {product.name}
            {archived && <Badge variant="neutral">Archived</Badge>}
            {product.compareAtPriceCents !== null && <Badge variant="sale">On sale</Badge>}
          </span>
        }
        description={`${product.categoryName} · added ${formatDate(product.createdAtUtc, settings.timeZoneId)} · last changed ${formatDate(product.updatedAtUtc, settings.timeZoneId)}`}
        actions={
          <>
            {!archived && (
              <Button asChild variant="ghost">
                <Link href={`/products/${product.id}`} target="_blank">
                  View in the store
                  <ExternalLink aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              </Button>
            )}
            <ArchiveButton product={product} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="details-heading" className={card}>
          <h2 id="details-heading" className="mb-5 text-h4">
            Details
          </h2>
          {/* A new version of the product (after a save, a deal or a conflict) starts the form again from it */}
          <ProductForm key={product.rowVersion} product={product} categories={categories} />
        </section>

        <section aria-labelledby="deal-heading" className={`${card} self-start`}>
          <h2 id="deal-heading" className="mb-3 text-h4">
            Deal
          </h2>
          {archived ? (
            <p className="text-sm text-muted-foreground">Restore the product to put it on sale.</p>
          ) : (
            <DealForm key={product.rowVersion} product={product} />
          )}
        </section>
      </div>
    </>
  );
}
