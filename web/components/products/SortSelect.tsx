"use client";

import { useRouter } from "next/navigation";
import { productFiltersHref, sortOptions, type ProductFilters, type SortOption } from "@/lib/product-filters";

// A native select: keyboard and screen readers handle it the way people expect. Changing it keeps
// the filters and goes back to page 1.
export function SortSelect({ filters }: { filters: ProductFilters }) {
  const router = useRouter();

  return (
    // The pill's border marks the control; the select inside it carries the focus ring
    <label className="inline-flex h-10 items-center gap-2.5 rounded-full border border-input bg-foreground/3 pl-3.5 pr-2 text-sm text-muted-foreground">
      Sort
      <select
        value={filters.sort}
        onChange={(event) => router.push(productFiltersHref({ ...filters, sort: event.target.value as SortOption, page: 1 }))}
        className="h-8 cursor-pointer rounded-full bg-transparent pr-1 font-semibold text-foreground"
      >
        {Object.entries(sortOptions).map(([value, option]) => (
          <option key={value} value={value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
