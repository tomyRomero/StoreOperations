import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Plus, SearchX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListSearch } from "@/components/admin/list/ListSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Button } from "@/components/ui/button";
import { firstValue } from "@/lib/paging";
import { getAdminCategories } from "@/lib/data/admin-catalog";
import type { SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Categories" };

// A store has a handful of categories, so they all load at once and the search narrows them here
export default async function CategoriesPage(props: { searchParams: Promise<SearchParams> }) {
  const search = (firstValue((await props.searchParams).q) ?? "").trim().toLowerCase();
  const categories = await getAdminCategories();
  const shown = categories?.filter((c) => c.name.toLowerCase().includes(search)) ?? [];

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={categories ? `${categories.length} ${categories.length === 1 ? "category" : "categories"}` : undefined}
        actions={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus aria-hidden />
              Add category
            </Link>
          </Button>
        }
      />
      <div className="mb-4">
        <ListSearch label="Search categories" />
      </div>

      {categories === null ? (
        <ErrorState title="We couldn't load the categories" action={<RetryButton />} />
      ) : shown.length === 0 ? (
        search ? (
          <EmptyState icon={SearchX} title="No categories match" className="bg-card">
            Try another name.
          </EmptyState>
        ) : (
          <EmptyState
            icon={LayoutGrid}
            title="No categories yet"
            className="bg-card"
            action={
              <Button asChild>
                <Link href="/admin/categories/new">Add the first category</Link>
              </Button>
            }
          >
            Every product belongs to a category, so start here.
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/categories/${category.id}`}
                className="group flex items-center gap-4 rounded-xl border bg-card p-3 transition-colors hover:border-foreground"
              >
                <Image src={category.imageUrl} alt="" width={72} height={72} className="aspect-square shrink-0 rounded-sm object-cover" />
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate font-semibold group-hover:underline">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
