import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table";
import ProductRow from "@/components/tables/ProductRow";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/forms/SearchBar";
import type { ProductStatus } from "@/lib/api/types";
import { getAdminProducts } from "@/lib/data/admin-catalog";
import { getStoreSettings } from "@/lib/data/catalog";

const tabs: { status: ProductStatus; label: string }[] = [
  { status: "active", label: "In the store" },
  { status: "archived", label: "Archived" },
  { status: "all", label: "All" },
];

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? "";
  const status = tabs.find((t) => t.status === searchParams.status)?.status ?? "active";
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const [products, settings] = await Promise.all([
    getAdminProducts({ search, status, page: pageNumber }),
    getStoreSettings(),
  ]);

  // Keeps the search and the tab while paging or switching tabs
  const pathWith = (next: ProductStatus) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (next !== "active") params.set("status", next);
    return `/adminproducts?${params.toString()}`;
  };

  return (
    <section className="grid grid-cols-1 gap-4 md:pt-24 max-sm:pt-20 lg:pt-0">
      <div className="flex items-center">
        <h1 className="font-semibold text-heading4-bold">Products</h1>
        <Button asChild className="ml-auto" size="sm">
          <Link href="/adminaddproduct">Add product</Link>
        </Button>
      </div>
      <SearchBar routeType="adminproducts" placeholder="Search products by name or category" />
      <nav aria-label="Filter products" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.status}
            href={pathWith(tab.status)}
            aria-current={tab.status === status ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-sm ${tab.status === status ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="border shadow-xs rounded-lg">
        {!products || !settings ? (
          <p className="p-10 text-center text-red-600">Failed to load products. Please try again later.</p>
        ) : products.totalCount === 0 ? (
          <p className="p-10">{search || status !== "active" ? "No products match." : "No products yet. Click Add product to get started."}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black w-[80px]"><span className="sr-only">Image</span></TableHead>
                <TableHead className="font-bold text-black max-w-[150px]">Name</TableHead>
                <TableHead className="font-bold text-black">Actions</TableHead>
                <TableHead className="font-bold text-black text-center">Stock</TableHead>
                <TableHead className="font-bold text-black text-center">Price</TableHead>
                <TableHead className="font-bold text-black">Category</TableHead>
                <TableHead className="font-bold text-black">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.items.map((product) => (
                <ProductRow key={product.id} product={product} lowStockThreshold={settings.lowStockThreshold} timeZone={settings.timeZoneId} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {products && (
        <Pagination
          path={`${pathWith(status)}&`}
          pageNumber={products.page}
          isNext={products.page < products.totalPages}
        />
      )}
    </section>
  );
}
