import Link from "next/link";
import { X } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { clearedFilters, productFiltersHref, type ProductFilters } from "@/lib/product-filters";

type Chip = { label: string; href: string };

// "Paint ×" "On sale ×" "In stock ×" "$5.00 – $30.00 ×": each is a link to the same list without that filter. Phones
// also get "Clear all" here; larger screens have it on the filters panel.
export function ActiveFilters({ filters, categories }: { filters: ProductFilters; categories: Category[] }) {
  const base = { ...filters, page: 1 };
  const chips: Chip[] = [
    ...filters.categoryIds.map((id) => ({
      label: categories.find((c) => c.id === id)?.name ?? "Category",
      href: productFiltersHref({ ...base, categoryIds: filters.categoryIds.filter((other) => other !== id) }),
    })),
    ...(filters.onSale ? [{ label: "On sale", href: productFiltersHref({ ...base, onSale: false }) }] : []),
    ...(filters.inStock ? [{ label: "In stock", href: productFiltersHref({ ...base, inStock: false }) }] : []),
    ...(filters.minCents !== null || filters.maxCents !== null
      ? [{ label: priceLabel(filters.minCents, filters.maxCents), href: productFiltersHref({ ...base, minCents: null, maxCents: null }) }]
      : []),
  ];

  if (chips.length === 0) return null;

  const clearAll = productFiltersHref(clearedFilters(filters));

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Filters in use">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={chip.href}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-glow-violet/50 bg-glow-violet/14 pl-3 pr-1.5 text-[13px] font-medium text-accent-ink transition-colors hover:bg-glow-violet/24"
          >
            {chip.label}
            <span aria-hidden className="grid size-[18px] place-items-center rounded-full bg-foreground/12">
              <X className="size-3" />
            </span>
            <span className="sr-only">(remove this filter)</span>
          </Link>
        </li>
      ))}
      <li className="lg:hidden">
        <Link href={clearAll} className="px-1 text-[13px] text-muted-foreground underline underline-offset-3 hover:text-foreground">
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
