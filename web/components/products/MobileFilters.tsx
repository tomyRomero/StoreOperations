"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api/browser";
import type { Category } from "@/lib/api/types";
import { activeFilterCount, clearedFilters, productFiltersHref, type ProductFilters as Filters } from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import { ProductFilters } from "./ProductFilters";
import { useCountOf } from "@/components/StoreBrandProvider";

type Props = {
  categories: Category[];
  counts: Record<number, number>;
  filters: Filters;
};

// On phones the filters open in a sheet from the bottom. As boxes change, the Show button says how many
// products they'd find; pressing it applies them and closes the sheet.
export function MobileFilters({ categories, counts, filters }: Props) {
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState<number | null>(null);
  const countOf = useCountOf();
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = activeFilterCount(filters);

  // Asks for just the count, a moment after the last change, and keeps only the newest answer
  const preview = (draft: Filters) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const request = ++latest.current;
      const { data } = await api.GET("/api/products", {
        params: {
          query: {
            categoryId: draft.categoryIds,
            search: draft.q || undefined,
            onDeal: draft.onSale || undefined,
            inStock: draft.inStock || undefined,
            minPriceCents: draft.minCents ?? undefined,
            maxPriceCents: draft.maxCents ?? undefined,
            pageSize: 1,
          },
        },
      });
      if (request === latest.current) setFound(data?.totalCount ?? null);
    }, 250);
  };

  const showLabel = found === null ? "Show results" : found === 0 ? "Nothing matches yet" : `Show ${countOf(found)}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors lg:hidden",
            active > 0 ? "bg-primary text-primary-foreground" : "border border-input hover:bg-foreground/5",
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters{active > 0 && ` · ${active}`}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="gap-5 overflow-y-auto rounded-t-[28px] border-foreground/12 bg-popover px-5 pb-7 pt-2.5">
        <span aria-hidden className="h-[5px] w-10 self-center rounded-full bg-foreground/20" />
        <div className="flex items-center justify-between pr-12">
          <SheetTitle className="font-sans text-[22px] font-semibold tracking-[-0.03em]">Filters</SheetTitle>
          {active > 0 && (
            <Link href={productFiltersHref(clearedFilters(filters))} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground underline underline-offset-3">
              Clear all
            </Link>
          )}
        </div>
        <SheetDescription className="sr-only">Narrow the list by category, price, deals and availability.</SheetDescription>
        <ProductFilters
          categories={categories}
          counts={counts}
          filters={filters}
          idPrefix="sheet"
          variant="sheet"
          onDraftChange={preview}
          footer={
            <button
              type="submit"
              onClick={() => setOpen(false)}
              className="mt-1 h-14 w-full rounded-button bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <span aria-live="polite">{showLabel}</span>
            </button>
          }
        />
      </SheetContent>
    </Sheet>
  );
}
