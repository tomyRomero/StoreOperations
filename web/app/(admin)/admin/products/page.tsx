import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plus, SearchX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterTabs } from "@/components/admin/list/FilterTabs";
import { ListSearch } from "@/components/admin/list/ListSearch";
import { ParamSelect } from "@/components/admin/list/ParamSelect";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import type { AdminProductSort, ProductStatus, StockLevel } from "@/lib/api/types";
import { firstValue, listHref, nextSort, oneOf, pageNumber, withParams } from "@/lib/admin-lists";
import { adminProductsPageSize, getAdminCategories, getAdminProducts } from "@/lib/data/admin-catalog";
import { getAdminSettings } from "@/lib/data/admin-store";
import type { SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Products" };

const path = "/admin/products";
const tabs: { status: ProductStatus; label: string }[] = [
  { status: "active", label: "In the store" },
  { status: "archived", label: "Archived" },
  { status: "all", label: "All" },
];
const stockLevels: { value: StockLevel; label: string }[] = [
  { value: "in_stock", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "sold_out", label: "Sold out" },
];
const sorts: AdminProductSort[] = ["name", "name_desc", "price", "price_desc", "stock", "stock_desc", "created", "created_desc"];

export default async function ProductsPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const search = firstValue(params.q)?.trim() ?? "";
  const status = oneOf(params.status, ["archived", "all"] as const) ?? "active";
  const categoryId = Number.parseInt(firstValue(params.category) ?? "", 10) || undefined;
  const stock = oneOf(params.stock, stockLevels.map((s) => s.value));
  const onDeal = firstValue(params.deal) === "1";
  const sort = oneOf(params.sort, sorts);
  const page = pageNumber(params.page);

  const [products, categories, settings] = await Promise.all([
    getAdminProducts({ search, status, categoryId, stock, onDeal, sort, page }),
    getAdminCategories(),
    getAdminSettings(),
  ]);

  const href = (changes: Record<string, string | undefined>) => listHref(path, withParams(params, changes));
  // Newest first is the default, so it has no ?sort of its own
  const sortHref = (column: string, firstDescending: boolean) => {
    const next = nextSort(sort ?? "created_desc", column, firstDescending);
    return href({ sort: next === "created_desc" ? undefined : next });
  };
  const filtered = Boolean(search || categoryId || stock || onDeal || status !== "active");

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={products ? `${products.totalCount} ${products.totalCount === 1 ? "product" : "products"}${filtered ? " match" : " in the store"}` : undefined}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus aria-hidden />
              Add product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3">
        <FilterTabs
          label="Show products"
          tabs={tabs.map((tab) => ({ label: tab.label, href: href({ status: tab.status === "active" ? undefined : tab.status }), current: tab.status === status }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          <ListSearch label="Search products by name" />
          <ParamSelect
            label="Category"
            param="category"
            anyLabel="All categories"
            options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <ParamSelect label="Stock" param="stock" anyLabel="Any stock" options={stockLevels} />
          <ParamSelect label="Deals" param="deal" anyLabel="On sale or not" options={[{ value: "1", label: "On sale" }]} />
        </div>
      </div>

      {!products || !categories || !settings ? (
        <ErrorState title="We couldn't load the products" action={<RetryButton />} />
      ) : products.items.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="No products match"
            action={
              <Button asChild variant="outline">
                <Link href={path}>Show all products</Link>
              </Button>
            }
          >
            Try another search or filter.
          </EmptyState>
        ) : (
          <EmptyState
            icon={Package}
            title="No products yet"
            action={
              <Button asChild>
                <Link href="/admin/products/new">Add the first product</Link>
              </Button>
            }
          >
            Products you add appear in the store straight away.
          </EmptyState>
        )
      ) : (
        <div className="grid gap-4">
          <ProductsTable
            products={products.items}
            categories={categories}
            lowStockThreshold={settings.lowStockThreshold}
            timeZone={settings.timeZoneId}
            sort={sort ?? "created_desc"}
            sortHrefs={{ name: sortHref("name", false), price: sortHref("price", true), stock: sortHref("stock", false), created: sortHref("created", true) }}
          />
          <Pagination
            pathname={path}
            searchParams={params}
            page={products.page}
            totalPages={products.totalPages}
            totalCount={products.totalCount}
            pageSize={adminProductsPageSize}
          />
        </div>
      )}
    </>
  );
}
