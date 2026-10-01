"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { dollarsText } from "@/lib/money";
import type { SearchParams } from "@/lib/paging";
import { activeFilterCount, clearedFilters, parseProductFilters, productFiltersHref, type ProductFilters as Filters } from "@/lib/product-filters";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  // How many products each category has, by id
  counts: Record<number, number>;
  filters: Filters;
  // Two copies render (the sidebar and the phone sheet), so their field ids need different prefixes
  idPrefix: string;
  // The sidebar applies a ticked box straight away; the phone sheet waits for its Show button
  variant: "rail" | "sheet";
  // Called with the filters as the form now stands, so the sheet can say how many products they'd show
  onDraftChange?: (draft: Filters) => void;
  footer?: React.ReactNode;
};

// The filters as the form's boxes now stand
export function readFilters(form: HTMLFormElement): Filters {
  const data = new FormData(form);
  const params: SearchParams = {};
  for (const key of new Set(data.keys())) params[key] = data.getAll(key).map(String);
  return parseProductFilters(params);
}

const legend = "mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint";

// A plain GET form to /products, so the filters work before JavaScript loads. Once it has, a submit
// becomes a client-side navigation to the same address the rest of the page builds (empty boxes left
// out, page 1).
export function ProductFilters({ categories, counts, filters, idPrefix, variant, onDraftChange, footer }: Props) {
  const router = useRouter();
  const rail = variant === "rail";

  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(productFiltersHref(readFilters(event.currentTarget)));
  };

  // A box or switch in the sidebar applies at once; prices wait for Apply price
  const changed = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement;
    if (rail && target.type === "checkbox") event.currentTarget.requestSubmit();
    onDraftChange?.(readFilters(event.currentTarget));
  };

  return (
    <form
      action="/products"
      method="get"
      onSubmit={apply}
      onChange={changed}
      className={cn("grid", rail ? "gap-6 rounded-[24px] border bg-linear-to-b from-foreground/4 to-foreground/[0.015] p-6" : "gap-5")}
    >
      {/* Search and sort carry over; a new filter always starts from page 1 */}
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {filters.sort !== "newest" && <input type="hidden" name="sort" value={filters.sort} />}

      {rail && (
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-base font-semibold">Filters</h2>
          {activeFilterCount(filters) > 0 && (
            <Link href={productFiltersHref(clearedFilters(filters))} className="text-[13px] text-muted-foreground underline underline-offset-3 hover:text-foreground">
              Clear all
            </Link>
          )}
        </div>
      )}

      <fieldset>
        <legend className={legend}>Category</legend>
        <div className={rail ? "grid gap-3" : "flex flex-wrap gap-2"}>
          {categories.map((category) =>
            rail ? (
              <label key={category.id} className="flex cursor-pointer items-center gap-3 text-[15px]">
                <span className="relative inline-grid size-5 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    name="category"
                    value={category.id}
                    defaultChecked={filters.categoryIds.includes(category.id)}
                    className="peer size-5 cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-input transition-colors checked:border-primary checked:bg-primary"
                  />
                  <Check aria-hidden strokeWidth={3} className="pointer-events-none absolute size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100" />
                </span>
                <span className="grow">{category.name}</span>
                {counts[category.id] !== undefined && <span className="font-mono text-xs text-faint">{counts[category.id]}</span>}
              </label>
            ) : (
              // Pills that fill in when chosen; the box itself is hidden, the pill shows its focus
              <label
                key={category.id}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-input px-4 text-[15px] transition-colors has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
              >
                <input type="checkbox" name="category" value={category.id} defaultChecked={filters.categoryIds.includes(category.id)} className="sr-only" />
                {category.name}
                {counts[category.id] !== undefined && <span className="font-mono text-xs opacity-70">{counts[category.id]}</span>}
              </label>
            ),
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legend}>Price</legend>
        <div className="grid grid-cols-2 gap-2.5">
          <PriceField id={`${idPrefix}-min`} name="min" label="Lowest price" placeholder="Min" cents={filters.minCents} tall={!rail} />
          <PriceField id={`${idPrefix}-max`} name="max" label="Highest price" placeholder="Max" cents={filters.maxCents} tall={!rail} />
        </div>
        {rail && (
          <button type="submit" className="mt-3 h-10 w-full rounded-xl border border-foreground/14 bg-foreground/6 text-sm font-semibold transition-colors hover:bg-foreground/10">
            Apply price
          </button>
        )}
      </fieldset>

      <fieldset className={rail ? "grid gap-3.5" : "grid"}>
        <legend className={cn(legend, !rail && "sr-only")}>Availability</legend>
        <Toggle name="sale" label="On sale" defaultChecked={filters.onSale} roomy={!rail} />
        <Toggle name="inStock" label="In stock" defaultChecked={filters.inStock} roomy={!rail} />
      </fieldset>

      {footer}
    </form>
  );
}

function PriceField({ id, name, label, placeholder, cents, tall }: { id: string; name: string; label: string; placeholder: string; cents: number | null; tall: boolean }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-text items-center gap-1.5 rounded-xl border border-input bg-foreground/3 px-3 text-faint has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        tall ? "h-12 rounded-[14px] text-[15px]" : "h-11 text-sm",
      )}
    >
      <span aria-hidden>$</span>
      <span className="sr-only">{label}</span>
      <input
        id={id}
        name={name}
        inputMode="decimal"
        placeholder={placeholder}
        defaultValue={cents !== null ? dollarsText(cents) : ""}
        className="w-full min-w-0 bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

// A switch built on a real checkbox, so it submits with the form and works before JavaScript loads
function Toggle({ name, label, defaultChecked, roomy }: { name: string; label: string; defaultChecked: boolean; roomy: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-3", roomy ? "h-[54px] border-t border-foreground/7 text-base" : "text-[15px]")}>
      {label}
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          name={name}
          value="1"
          defaultChecked={defaultChecked}
          className={cn(
            "peer cursor-pointer appearance-none rounded-full border border-input bg-foreground/6 transition-colors checked:border-glow-violet checked:bg-glow-violet",
            roomy ? "h-7 w-[46px]" : "h-6 w-10",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-[3px] top-[3px] rounded-full bg-muted-foreground transition-transform duration-200 peer-checked:bg-white",
            roomy ? "size-[22px] peer-checked:translate-x-[18px]" : "size-[18px] peer-checked:translate-x-4",
          )}
        />
      </span>
    </label>
  );
}
