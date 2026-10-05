import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterTab = { label: string; href: string; current: boolean };

// One way of narrowing a list (by status, by role), as links: each tab is its own address
export function FilterTabs({ label, tabs }: { label: string; tabs: FilterTab[] }) {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto">
      <ul className="flex w-max gap-1 px-1">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              scroll={false}
              aria-current={tab.current ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                tab.current ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
