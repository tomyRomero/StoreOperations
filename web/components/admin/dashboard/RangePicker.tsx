"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashboardRanges, type DashboardRange } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const href = (days: DashboardRange) => (days === 30 ? "/admin" : `/admin?days=${days}`);

// While the next period loads, the current figures stay in place, dimmed, instead of flashing skeletons
export function RangePicker({ days, children }: { days: DashboardRange; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <nav aria-label="Period" className="flex w-fit rounded-xl border bg-card p-1">
        {dashboardRanges.map((range) => (
          <Link
            key={range}
            href={href(range)}
            aria-current={range === days ? "page" : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey) return;
              event.preventDefault();
              startTransition(() => router.push(href(range), { scroll: false }));
            }}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors",
              range === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Last {range} days
          </Link>
        ))}
      </nav>
      <div aria-busy={pending} className={cn("grid gap-6 transition-opacity", pending && "opacity-60")}>
        {children}
      </div>
    </div>
  );
}
