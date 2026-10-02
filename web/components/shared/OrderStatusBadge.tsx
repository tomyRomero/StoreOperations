import type { OrderStatus } from "@/lib/api/types";
import { orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// The dot only repeats the color; the label always says the status
const tones: Record<OrderStatus, string> = {
  pending: "bg-warning-subtle text-warning [--dot:var(--glow-amber)]",
  shipped: "bg-info-subtle text-info [--dot:var(--glow-blue)]",
  delivered: "bg-success-subtle text-success [--dot:var(--glow-green)]",
  cancelled: "bg-foreground/8 text-ink-2 [--dot:var(--faint)]",
  refunded: "bg-foreground/8 text-ink-2 [--dot:var(--faint)]",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] font-medium tracking-normal", tones[status], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-(--dot)" />
      {orderStatusLabel(status)}
    </span>
  );
}
