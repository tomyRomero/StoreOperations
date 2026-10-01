import { Check, X } from "lucide-react";
import type { Order } from "@/lib/api/types";
import { formatDate, formatDay } from "@/lib/format";
import { orderProgress } from "@/lib/order-progress";
import { cn } from "@/lib/utils";

// Placed ─ Shipped ─ Delivered: across the page on large screens, down it on phones. Done steps are
// green with a tick, the current one is ink in a violet ring, the rest are hollow; a cancelled or
// refunded order ends on a quiet grey cross. Every step also says in words where the order is.
export function OrderTimeline({ order, timeZone }: { order: Order; timeZone: string }) {
  const steps = orderProgress(order);

  return (
    <ol className="grid gap-0 md:grid-flow-col md:auto-cols-fr">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const when = step.at
          ? formatDate(step.at, timeZone)
          : step.label === "Delivered" && order.estimatedDeliveryDate
            ? `Expected ${formatDay(order.estimatedDeliveryDate)}`
            : null;
        const filled = step.state === "done" || step.state === "current";

        return (
          <li
            key={step.label}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex gap-4 pb-6 md:flex-col md:gap-3 md:pb-0 md:pr-4"
          >
            {/* The line to the next step: down on phones, across on larger screens */}
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-0.5 md:left-7 md:top-[11px] md:h-0.5 md:w-[calc(100%-1.75rem)]",
                  steps[index + 1].state === "upcoming" ? "bg-foreground/10" : steps[index + 1].state === "ended" ? "bg-foreground/25" : "bg-glow-green"
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                step.state === "ended" && "bg-foreground/15 text-foreground",
                filled && step.state !== "current" && "bg-glow-green text-[#052e1f] shadow-[0_0_0_4px_rgb(52_211_153/0.18)]",
                step.state === "current" && "bg-primary ring-4 ring-glow-violet/30",
                step.state === "upcoming" && "border-[1.5px] border-input bg-card"
              )}
            >
              {step.state === "done" && <Check className="size-3.5" strokeWidth={3} />}
              {step.state === "ended" && <X className="size-3.5" />}
            </span>
            <div className="grid gap-0.5">
              <span className={cn("text-[15px] font-semibold", step.state === "upcoming" && "text-muted-foreground")}>
                {step.label}
                <span className="sr-only">
                  {step.state === "done" ? " (done)" : step.state === "current" ? " (current step)" : step.state === "upcoming" ? " (not yet)" : ""}
                </span>
              </span>
              {when && <span className="text-[13px] text-faint">{when}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
