import type { ProductSort } from "./api/types";
import { parseDollars } from "./money";
import type { SearchParams } from "./paging";

// The product list's state, read from its address: /products?q=brush&category=2&sale=1&inStock=1&min=5&max=30&sort=price-asc&page=2
// Links are shareable, back and forward work, and a refresh keeps the view.

export type ProductFilters = {
  q: string;
  categoryIds: number[];
  onSale: boolean;
  inStock: boolean;
  // Typed in dollars, sent to the API in cents
  minCents: number | null;
  maxCents: number | null;
  sort: SortOption;
  page: number;
};

// The sort as it reads in the address, and what the API calls it
export const sortOptions = {
  newest: { label: "Newest", api: "newest" },
  "price-asc": { label: "Price: low to high", api: "cheapest" },
  "price-desc": { label: "Price: high to low", api: "priciest" },
} as const satisfies Record<string, { label: string; api: ProductSort }>;

export type SortOption = keyof typeof sortOptions;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: string | string[] | undefined): string[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

// Anything that doesn't parse is ignored rather than refused, so an edited address still shows products
export function parseProductFilters(params: SearchParams): ProductFilters {
  const sort = first(params.sort);
  const page = Number(first(params.page));
  const ids = all(params.category).filter((id) => /^\d{1,9}$/.test(id)).map(Number);

  return {
    q: (first(params.q) ?? "").trim().slice(0, 100),
    categoryIds: [...new Set(ids)],
    onSale: first(params.sale) === "1",
    inStock: first(params.inStock) === "1",
    minCents: parseDollars(first(params.min) ?? ""),
    maxCents: parseDollars(first(params.max) ?? ""),
    sort: sort && sort in sortOptions ? (sort as SortOption) : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

// The address for these filters. Defaults are left out, so every view has one address.
export function productFiltersHref(filters: ProductFilters): string {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  for (const id of filters.categoryIds) query.append("category", String(id));
  if (filters.onSale) query.set("sale", "1");
  if (filters.inStock) query.set("inStock", "1");
  if (filters.minCents !== null) query.set("min", dollars(filters.minCents));
  if (filters.maxCents !== null) query.set("max", dollars(filters.maxCents));
  if (filters.sort !== "newest") query.set("sort", filters.sort);
  if (filters.page > 1) query.set("page", String(filters.page));
  const text = query.toString();
  return text ? `/products?${text}` : "/products";
}

// Whole dollars without decimals: 500 cents is "5", 750 is "7.50"
function dollars(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

// How many filters narrow the list (search and sort don't count)
// The same search and sort with every filter taken off, back on page 1
export function clearedFilters(filters: ProductFilters): ProductFilters {
  return { ...filters, categoryIds: [], onSale: false, inStock: false, minCents: null, maxCents: null, page: 1 };
}

export function activeFilterCount(filters: ProductFilters): number {
  return filters.categoryIds.length + (filters.onSale ? 1 : 0) + (filters.inStock ? 1 : 0) + (filters.minCents !== null || filters.maxCents !== null ? 1 : 0);
}
