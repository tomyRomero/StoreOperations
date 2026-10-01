import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Comparison } from "@/lib/api/types";
import { change } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  comparison: Comparison;
  format: (value: number) => string;
  // "the 30 days before", for the comparison line
  previousPeriod: string;
  // The headline figure is larger; there is one per page
  hero?: boolean;
  className?: string;
};

// A figure, and how it compares with the period before. Up is good for every figure shown here.
export function StatTile({ label, comparison, format, previousPeriod, hero, className }: Props) {
  const delta = change(comparison);
  const Icon = delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;

  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className={cn("font-sans font-semibold tracking-tight", hero ? "text-5xl" : "text-3xl")}>{format(comparison.value)}</p>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        {delta ? (
          <>
            <Icon
              className={cn("size-4 shrink-0", delta.direction === "up" && "text-success", delta.direction === "down" && "text-sale")}
              aria-hidden
            />
            <span>
              <span className={cn("font-semibold", delta.direction === "up" && "text-success", delta.direction === "down" && "text-sale")}>
                {delta.direction === "same" ? "No change" : `${delta.direction === "up" ? "Up" : "Down"} ${delta.percent}%`}
              </span>{" "}
              on {previousPeriod} ({format(comparison.previous)})
            </span>
          </>
        ) : (
          <span>None in {previousPeriod}</span>
        )}
      </p>
    </div>
  );
}
