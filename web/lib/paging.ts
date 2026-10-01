// Page links for lists whose state lives in the address (?q=&category=&page=2)

export type SearchParams = Record<string, string | string[] | undefined>;

// The same address on another page, keeping every other parameter. Page 1 has no ?page at all, so
// there's one address for the first page.
export function pageHref(pathname: string, params: SearchParams, page: number): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    for (const one of Array.isArray(value) ? value : [value]) query.append(key, one);
  }
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}

// The page numbers to offer: the first, the last, and the current one with its neighbors. "gap" marks
// skipped pages: 1 … 4 5 6 … 12.
export function pageNumbers(page: number, totalPages: number): (number | "gap")[] {
  const shown = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const sorted = [...shown].sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  for (const n of sorted) {
    const previous = result.at(-1);
    if (typeof previous === "number" && n - previous === 2) result.push(n - 1);
    else if (typeof previous === "number" && n - previous > 2) result.push("gap");
    result.push(n);
  }
  return result;
}

// "Showing 9–16 of 40"
export function showingRange(page: number, pageSize: number, totalCount: number): string {
  if (totalCount === 0) return "Nothing to show";
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);
  return `Showing ${first}–${last} of ${totalCount}`;
}
