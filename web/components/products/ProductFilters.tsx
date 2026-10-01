"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/api/types";
import { dollarsText } from "@/lib/money";
import type { SearchParams } from "@/lib/paging";
import { parseProductFilters, productFiltersHref, type ProductFilters as Filters } from "@/lib/product-filters";

type Props = {
  categories: Category[];
  filters: Filters;
  // Two copies render (the sidebar and the phone drawer), so their field ids need different prefixes
  idPrefix: string;
  // The sidebar applies a ticked box straight away; the phone drawer waits for "Show results"
  autoApply?: boolean;
  footer?: React.ReactNode;
};

// A plain GET form to /products, so the filters work before JavaScript loads. Once it has, a submit
// becomes a client-side navigation to the same address the rest of the page builds (empty boxes left
// out, page 1).
export function ProductFilters({ categories, filters, idPrefix, autoApply = false, footer }: Props) {
  const router = useRouter();

  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params: SearchParams = {};
    for (const key of new Set(data.keys())) params[key] = data.getAll(key).map(String);
    router.push(productFiltersHref(parseProductFilters(params)));
  };

  const applyNow = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (autoApply) event.currentTarget.form?.requestSubmit();
  };

  return (
    <form action="/products" method="get" onSubmit={apply} className="grid gap-8">
      {/* Search and sort carry over; a new filter always starts from page 1 */}
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {filters.sort !== "newest" && <input type="hidden" name="sort" value={filters.sort} />}

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-semibold">Category</legend>
        {categories.map((category) => (
          <label key={category.id} className="flex min-h-6 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="category"
              value={category.id}
              defaultChecked={filters.categoryIds.includes(category.id)}
              onChange={applyNow}
              className="size-4 accent-primary"
            />
            {category.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-semibold">Availability</legend>
        <label className="flex min-h-6 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="inStock" value="1" defaultChecked={filters.inStock} onChange={applyNow} className="size-4 accent-primary" />
          In stock only
        </label>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-semibold">Price</legend>
        <div className="flex items-end gap-2">
          <div className="grid flex-1 gap-1">
            <label htmlFor={`${idPrefix}-min`} className="text-xs text-muted-foreground">
              From ($)
            </label>
            <Input
              id={`${idPrefix}-min`}
              name="min"
              inputMode="decimal"
              placeholder="0"
              defaultValue={filters.minCents !== null ? dollarsText(filters.minCents) : ""}
            />
          </div>
          <span aria-hidden className="pb-2 text-muted-foreground">
            –
          </span>
          <div className="grid flex-1 gap-1">
            <label htmlFor={`${idPrefix}-max`} className="text-xs text-muted-foreground">
              To ($)
            </label>
            <Input
              id={`${idPrefix}-max`}
              name="max"
              inputMode="decimal"
              placeholder="Any"
              defaultValue={filters.maxCents !== null ? dollarsText(filters.maxCents) : ""}
            />
          </div>
        </div>
        {autoApply && (
          <Button type="submit" variant="outline" size="sm" className="justify-self-start">
            Apply price
          </Button>
        )}
      </fieldset>

      {footer}
    </form>
  );
}
