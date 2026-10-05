import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/api/types";
import { productFiltersHref, type ProductFilters } from "@/lib/product-filters";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  counts: Record<number, number>;
  filters: ProductFilters;
};

const chip =
  "inline-flex h-12 shrink-0 items-center gap-3 rounded-full border pl-1.5 pr-4 transition-colors hover:border-foreground/24 lg:h-14 lg:pl-2 lg:pr-4.5";

// One tap to a single category (or all of them), keeping the search, sort and other filters
export function CategoryChips({ categories, counts, filters }: Props) {
  const base = { ...filters, page: 1 };
  const all = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const chips = [
    { key: "all", name: "All", href: productFiltersHref({ ...base, categoryIds: [] }), current: filters.categoryIds.length === 0, count: all, image: null },
    ...categories.map((category) => ({
      key: String(category.id),
      name: category.name,
      href: productFiltersHref({ ...base, categoryIds: [category.id] }),
      current: filters.categoryIds.length === 1 && filters.categoryIds[0] === category.id,
      count: counts[category.id],
      image: category.imageUrl,
    })),
  ];

  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <ul className="flex gap-2">
        {chips.map((c) => (
          <li key={c.key}>
            <Link
              href={c.href}
              aria-current={c.current ? "page" : undefined}
              className={cn(chip, c.current ? "border-foreground/30 bg-foreground/8" : "border-foreground/10")}
            >
              <span className="relative grid size-9 place-items-center overflow-hidden rounded-full bg-foreground/6 lg:size-10">
                {c.image ? (
                  <Image src={c.image} alt="" fill sizes="40px" className="object-contain p-1.5" />
                ) : (
                  <span aria-hidden className="size-5 rounded-md bg-brand-sweep" />
                )}
              </span>
              <span className="text-[15px] font-semibold">{c.name}</span>
              {c.count !== undefined && <span className={cn("font-mono text-xs", c.current ? "text-ink-2" : "text-faint")}>{c.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
