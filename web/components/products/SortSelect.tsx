"use client";

import { useRouter } from "next/navigation";
import { fieldClasses } from "@/components/ui/input";
import { productFiltersHref, sortOptions, type ProductFilters, type SortOption } from "@/lib/product-filters";
import { cn } from "@/lib/utils";

// A native select: keyboard and screen readers handle it the way people expect. Changing it keeps
// the filters and goes back to page 1.
export function SortSelect({ filters }: { filters: ProductFilters }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground max-sm:sr-only">Sort by</span>
      <select
        value={filters.sort}
        onChange={(event) => router.push(productFiltersHref({ ...filters, sort: event.target.value as SortOption, page: 1 }))}
        className={cn(fieldClasses, "h-10 w-auto py-0 pr-8")}
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
