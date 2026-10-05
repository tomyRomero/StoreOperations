import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { sortDirection } from "@/lib/admin-lists";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  column: string;
  // The list's current sort, such as "total_desc"
  sort: string | undefined;
  // Where clicking goes: the same list sorted the other way, or by this column
  href: string;
  className?: string;
};

// A column header that sorts the list. Screen readers hear the current order through aria-sort.
export function SortableHead({ label, column, sort, href, className }: Props) {
  const direction = sortDirection(sort, column);
  const Icon = direction === "ascending" ? ArrowUp : direction === "descending" ? ArrowDown : ChevronsUpDown;

  return (
    <TableHead aria-sort={direction} className={className}>
      <Link
        href={href}
        scroll={false}
        className={cn("-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 hover:text-foreground", direction !== "none" && "text-foreground")}
      >
        {label}
        <Icon className={cn("size-3.5", direction === "none" && "opacity-50")} aria-hidden />
        <span className="sr-only">{direction === "none" ? ", sort by this column" : ", change the sort order"}</span>
      </Link>
    </TableHead>
  );
}
