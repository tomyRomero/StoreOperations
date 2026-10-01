import Link from "next/link";
import { X } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { productFiltersHref, type ProductFilters } from "@/lib/product-filters";

type Chip = { label: string; href: string };

// "Paint ×" "In stock ×" "$5.00 – $30.00 ×" and "Clear all": each is a link to the same list without that filter
export function ActiveFilters({ filters, categories }: { filters: ProductFilters; categories: Category[] }) {
  const base = { ...filters, page: 1 };
  const chips: Chip[] = [
    ...filters.categoryIds.map((id) => ({
      label: categories.find((c) => c.id === id)?.name ?? "Category",
      href: productFiltersHref({ ...base, categoryIds: filters.categoryIds.filter((other) => other !== id) }),
    })),
    ...(filters.inStock ? [{ label: "In stock", href: productFiltersHref({ ...base, inStock: false }) }] : []),
    ...(filters.minCents !== null || filters.maxCents !== null
      ? [{ label: priceLabel(filters.minCents, filters.maxCents), href: productFiltersHref({ ...base, minCents: null, maxCents: null }) }]
      : []),
  ];

  if (chips.length === 0) return null;

  const clearAll = productFiltersHref({ ...base, categoryIds: [], inStock: false, minCents: null, maxCents: null });

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Filters in use">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={chip.href}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden />
            <span className="sr-only">(remove this filter)</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={clearAll} className="px-1 text-sm font-semibold text-accent underline-offset-4 hover:underline">
          Clear all
        </Link>
      </li>
    </ul>
  );
}

function priceLabel(minCents: number | null, maxCents: number | null): string {
  if (minCents !== null && maxCents !== null) return `${formatMoney(minCents)} – ${formatMoney(maxCents)}`;
  if (minCents !== null) return `From ${formatMoney(minCents)}`;
  return `Up to ${formatMoney(maxCents ?? 0)}`;
}
