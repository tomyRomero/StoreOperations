import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageHref, pageNumbers, showingRange, type SearchParams } from "@/lib/paging";
import { cn } from "@/lib/utils";

type Props = {
  // The list's address and its current parameters; every link keeps the filters and changes the page
  pathname: string;
  searchParams: SearchParams;
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  className?: string;
};

const item =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-semibold tabular-nums transition-colors";

// Real links, so pages can be opened in a new tab, shared, crawled and used without JavaScript
export function Pagination({ pathname, searchParams, page, totalPages, totalCount, pageSize, className }: Props) {
  if (totalPages <= 1) {
    return totalCount > 0 ? (
      <p className={cn("text-sm text-muted-foreground", className)}>{showingRange(1, pageSize, totalCount)}</p>
    ) : null;
  }

  const href = (n: number) => pageHref(pathname, searchParams, n);

  return (
    <nav aria-label="Pagination" className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      <p className="text-sm text-muted-foreground">{showingRange(page, pageSize, totalCount)}</p>
      <ul className="flex items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(item, "hover:bg-muted")} rel="prev">
              <ChevronLeft className="size-4" aria-hidden />
              <span className="max-sm:sr-only">Previous</span>
            </Link>
          ) : (
            <span aria-hidden className={cn(item, "cursor-default text-muted-foreground")}>
              <ChevronLeft className="size-4" />
              <span className="max-sm:hidden">Previous</span>
            </span>
          )}
        </li>
        {pageNumbers(page, totalPages).map((n, index) =>
          n === "gap" ? (
            <li key={`gap-${index}`} aria-hidden className={cn(item, "text-muted-foreground")}>
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(item, n === page ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              >
                {n}
              </Link>
            </li>
          )
        )}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} className={cn(item, "hover:bg-muted")} rel="next">
              <span className="max-sm:sr-only">Next</span>
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span aria-hidden className={cn(item, "cursor-default text-muted-foreground")}>
              <span className="max-sm:hidden">Next</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
