import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { MobileFilters } from "@/components/products/MobileFilters";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { SortSelect } from "@/components/products/SortSelect";
import type { Category } from "@/lib/api/types";
import { getCategories, getProducts, getStoreSettings } from "@/lib/data/catalog";
import type { SearchParams } from "@/lib/paging";
import { activeFilterCount, parseProductFilters, productFiltersHref, sortOptions, type ProductFilters as Filters } from "@/lib/product-filters";

const pageSize = 12;

type Props = { searchParams: Promise<SearchParams> };

function pageTitle(filters: Filters, categories: Category[]): string {
  if (filters.q) return `Results for “${filters.q}”`;
  if (filters.categoryIds.length === 1) return categories.find((c) => c.id === filters.categoryIds[0])?.name ?? "Shop";
  if (filters.onSale) return "On sale";
  return "Shop all supplies";
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const filters = parseProductFilters(await props.searchParams);
  return { title: pageTitle(filters, filters.categoryIds.length === 1 ? await getCategories() : []) };
}

// One page for browsing, filtering and search. Everything it shows comes from the address.
export default async function ProductsPage(props: Props) {
  const searchParams = await props.searchParams;
  const filters = parseProductFilters(searchParams);
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const href = productFiltersHref(filters);

  return (
    <div className="container py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/products" }, ...(href !== "/products" ? [{ label: pageTitle(filters, categories) }] : [])]} />
      <h1 className="mt-4 text-h1">{pageTitle(filters, categories)}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="max-lg:hidden">
          {/* Keyed by the address, so the boxes always match the list after back and forward */}
          <ProductFilters key={href} categories={categories} filters={filters} idPrefix="side" autoApply />
        </aside>

        <div className="grid min-w-0 content-start gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MobileFilters key={href} categories={categories} filters={filters} activeCount={activeFilterCount(filters)} />
            <div className="ml-auto">
              <SortSelect filters={filters} />
            </div>
          </div>
          <ActiveFilters filters={filters} categories={categories} />

          {/* The filters stay put while a new set of products loads */}
          <Suspense key={href} fallback={<ProductGridSkeleton />}>
            <ProductResults filters={filters} searchParams={searchParams} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ProductResults({ filters, searchParams, lowStockThreshold }: { filters: Filters; searchParams: SearchParams; lowStockThreshold: number }) {
  const products = await getProducts({
    categoryIds: filters.categoryIds,
    search: filters.q,
    onDeal: filters.onSale,
    inStock: filters.inStock,
    minPriceCents: filters.minCents,
    maxPriceCents: filters.maxCents,
    sort: sortOptions[filters.sort].api,
    page: filters.page,
    pageSize,
  });

  if (!products) {
    return (
      <ErrorState
        title="We couldn't load the products"
        action={
          <Button asChild>
            <a href={productFiltersHref(filters)}>Try again</a>
          </Button>
        }
      />
    );
  }

  if (products.items.length === 0) {
    const pastTheEnd = products.totalCount > 0;
    return (
      <EmptyState
        icon={PackageSearch}
        title={pastTheEnd ? "There's nothing on this page" : filters.q ? `Nothing matches “${filters.q}”` : "No products match these filters"}
        action={
          <Button asChild>
            <Link href={pastTheEnd ? productFiltersHref({ ...filters, page: 1 }) : "/products"}>{pastTheEnd ? "Go to the first page" : "See all supplies"}</Link>
          </Button>
        }
      >
        {pastTheEnd ? "The list is shorter than this page number." : "Try another word, or remove a filter to see more."}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-10">
      <h2 className="sr-only">Products</h2>
      <p className="-mt-2 text-sm text-muted-foreground" aria-live="polite">
        {products.totalCount === 1 ? "1 product" : `${products.totalCount} products`}
      </p>
      <ul className="-mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {products.items.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} lowStockThreshold={lowStockThreshold} priority={index < 4} />
          </li>
        ))}
      </ul>
      <Pagination
        pathname="/products"
        searchParams={searchParams}
        page={products.page}
        totalPages={products.totalPages}
        totalCount={products.totalCount}
        pageSize={products.pageSize}
      />
    </div>
  );
}
