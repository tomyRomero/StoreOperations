import type { Metadata } from "next";
import Link from "next/link";
import { cache, Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { CategoryChips } from "@/components/products/CategoryChips";
import { MobileFilters } from "@/components/products/MobileFilters";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { SortSelect } from "@/components/products/SortSelect";
import type { Category } from "@/lib/api/types";
import { getCategories, getCategorySummary, getProducts, getStoreSettings } from "@/lib/data/catalog";
import type { SearchParams } from "@/lib/paging";
import { parseProductFilters, productFiltersHref, sortOptions, type ProductFilters as Filters } from "@/lib/product-filters";

const pageSize = 12;

type Props = { searchParams: Promise<SearchParams> };

function pageTitle(filters: Filters, categories: Category[]): string {
  if (filters.q) return `Results for “${filters.q}”`;
  if (filters.categoryIds.length === 1) return categories.find((c) => c.id === filters.categoryIds[0])?.name ?? "Shop";
  if (filters.onSale) return "On sale";
  return "Shop all";
}

// One page of the list for these filters. Cached for the request, so the count above the list and the
// list itself share one call to the API.
const loadProducts = cache((href: string, filters: Filters) =>
  getProducts({
    categoryIds: filters.categoryIds,
    search: filters.q,
    onDeal: filters.onSale,
    inStock: filters.inStock,
    minPriceCents: filters.minCents,
    maxPriceCents: filters.maxCents,
    sort: sortOptions[filters.sort].api,
    page: filters.page,
    pageSize,
  }),
);

export async function generateMetadata(props: Props): Promise<Metadata> {
  const filters = parseProductFilters(await props.searchParams);
  return { title: pageTitle(filters, filters.categoryIds.length === 1 ? await getCategories() : []) };
}

// One page for browsing, filtering and search. Everything it shows comes from the address.
export default async function ProductsPage(props: Props) {
  const searchParams = await props.searchParams;
  const filters = parseProductFilters(searchParams);
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const summaries = await Promise.all(categories.map((category) => getCategorySummary(category.id)));
  const counts = Object.fromEntries(categories.map((category, i) => [category.id, summaries[i].count]));
  const href = productFiltersHref(filters);
  const title = pageTitle(filters, categories);

  return (
    <div className="relative isolate pb-8">
      <div aria-hidden className="absolute -left-[10%] -top-40 -z-10 h-[420px] w-[700px] max-w-full bg-[radial-gradient(50%_50%_at_50%_50%,rgb(139_108_255/0.22),transparent_70%)] opacity-(--glow-strength)" />

      <div className="container flex flex-col gap-5 pb-6 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:pb-9 lg:pt-12">
        <div className="grid gap-3.5">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/products" }, ...(href !== "/products" ? [{ label: title }] : [])]} />
          <h1 className="text-[44px] font-semibold leading-none tracking-[-0.05em] lg:text-7xl">{title}</h1>
        </div>
        <CategoryChips categories={categories} counts={counts} filters={filters} />
      </div>

      <div className="container grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside aria-label="Filters" className="sticky top-[100px] max-lg:hidden">
          {/* Keyed by the address, so the boxes always match the list after back and forward */}
          <ProductFilters key={href} categories={categories} counts={counts} filters={filters} idPrefix="side" variant="rail" />
        </aside>

        <div className="grid min-w-0 content-start gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <MobileFilters key={href} categories={categories} counts={counts} filters={filters} />
            <Suspense key={href}>
              <ResultCount href={href} filters={filters} />
            </Suspense>
            <ActiveFilters filters={filters} categories={categories} />
            <div className="ml-auto">
              <SortSelect filters={filters} />
            </div>
          </div>

          {/* The filters stay put while a new set of products loads */}
          <Suspense key={href} fallback={<ProductGridSkeleton />}>
            <ProductResults href={href} filters={filters} searchParams={searchParams} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ResultCount({ href, filters }: { href: string; filters: Filters }) {
  const products = await loadProducts(href, filters);
  if (!products) return null;
  return (
    <p className="text-[15px] text-muted-foreground max-lg:hidden" aria-live="polite">
      <b className="font-semibold text-foreground">{products.totalCount}</b> {products.totalCount === 1 ? "supply" : "supplies"}
    </p>
  );
}

async function ProductResults({ href, filters, searchParams, lowStockThreshold }: { href: string; filters: Filters; searchParams: SearchParams; lowStockThreshold: number }) {
  const products = await loadProducts(href, filters);

  if (!products) {
    return <ErrorState title="We couldn't load the products" action={<RetryButton />} />;
  }

  if (products.items.length === 0) {
    const pastTheEnd = products.totalCount > 0;
    return (
      <EmptyState
        icon={PackageSearch}
        title={pastTheEnd ? "There's nothing on this page" : filters.q ? `Nothing matches “${filters.q}”` : "No products match these filters"}
        action={
          <Button asChild className="rounded-full">
            <Link href={pastTheEnd ? productFiltersHref({ ...filters, page: 1 }) : "/products"}>{pastTheEnd ? "Go to the first page" : "See all supplies"}</Link>
          </Button>
        }
      >
        {pastTheEnd ? "The list is shorter than this page number." : "Try another word, or remove a filter to see more."}
      </EmptyState>
    );
  }

  // At the end of an in-stock list, offer the sold-out products too when there are some
  const lastPage = products.page >= products.totalPages;
  const withSoldOut = filters.inStock && lastPage ? await getProducts({ ...queryWithout(filters), pageSize: 1 }) : null;
  const soldOutHidden = withSoldOut !== null && withSoldOut.totalCount > products.totalCount;

  return (
    <div className="grid gap-8">
      <h2 className="sr-only">Products</h2>
      <p className="-mb-3 text-sm text-muted-foreground lg:hidden" aria-live="polite">
        {products.totalCount === 1 ? "1 supply" : `${products.totalCount} supplies`}
      </p>
      <ul className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-3">
        {products.items.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} lowStockThreshold={lowStockThreshold} priority={index < 3} />
          </li>
        ))}
      </ul>
      {soldOutHidden && (
        <p className="rounded-[18px] border border-dashed border-foreground/12 p-5 text-center text-sm text-muted-foreground">
          That&apos;s everything in stock.{" "}
          <Link href={productFiltersHref({ ...filters, inStock: false, page: 1 })} className="text-foreground underline underline-offset-3">
            Show sold-out supplies too
          </Link>
        </p>
      )}
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

// The same query without the in-stock filter
function queryWithout(filters: Filters) {
  return {
    categoryIds: filters.categoryIds,
    search: filters.q,
    onDeal: filters.onSale,
    minPriceCents: filters.minCents,
    maxPriceCents: filters.maxCents,
  };
}
