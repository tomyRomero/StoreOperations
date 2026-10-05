import { firstValue, type SearchParams } from "./paging";

// Admin lists keep their search, filters, sort and page in the address, so every view can be reloaded,
// shared and opened in a new tab. These read the address and build the next one.

// The value if it's one of the allowed ones
export function oneOf<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  const one = firstValue(value);
  return allowed.find((option) => option === one);
}

export function pageNumber(value: string | string[] | undefined): number {
  return Math.max(1, Number.parseInt(firstValue(value) ?? "1", 10) || 1);
}

// The list's address for these parameters. Empty ones are left out, and so is page 1.
export function listHref(pathname: string, params: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" && Number(value) <= 1) continue;
    query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}

// The current parameters with some changed. Any change other than the page goes back to page 1.
export function withParams(params: SearchParams, changes: Record<string, string | number | undefined>): Record<string, string | undefined> {
  const next: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) next[key] = firstValue(value);
  if (!("page" in changes)) delete next.page;
  for (const [key, value] of Object.entries(changes)) next[key] = value === undefined ? undefined : String(value);
  return next;
}

export type SortDirection = "ascending" | "descending" | "none";

// API sorts are a column ("price") or the column backwards ("price_desc")
export function sortDirection(current: string | undefined, column: string): SortDirection {
  if (current === column) return "ascending";
  if (current === `${column}_desc`) return "descending";
  return "none";
}

// Clicking a column header: the first click uses the column's natural direction (newest or biggest
// first for dates and amounts, A to Z for names), the next one turns it around
export function nextSort(current: string | undefined, column: string, firstDescending: boolean): string {
  const direction = sortDirection(current, column);
  if (direction === "ascending") return `${column}_desc`;
  if (direction === "descending") return column;
  return firstDescending ? `${column}_desc` : column;
}
