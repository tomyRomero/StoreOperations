import Link from "next/link";
import { ProductThumb } from "@/components/products/ProductThumb";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/lib/api/types";
import { carrierName, formatDate, formatDay } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { orderProgress, type ProgressStep } from "@/lib/order-progress";
import { cn } from "@/lib/utils";

// A finished step fills green to blue, the step the order is in fills part way, the rest wait in grey;
// an order that ended stops on a darker grey
const bars: Record<ProgressStep["state"], string> = {
  done: "bg-linear-to-r from-glow-green to-glow-blue",
  current: "bg-[linear-gradient(90deg,var(--glow-blue)_55%,color-mix(in_oklab,var(--foreground)_10%,transparent)_55%)]",
  upcoming: "bg-foreground/10",
  ended: "bg-foreground/30",
};

const spoken: Record<ProgressStep["state"], string> = { done: " (done)", current: " (current step)", upcoming: " (not yet)", ended: "" };

// The account overview's lead: the newest order, what's in it, and how far it has got
export function LatestOrder({ order, timeZone }: { order: Order; timeZone: string }) {
  const steps = orderProgress(order);
  const items = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  const when = (step: ProgressStep) => {
    if (step.at) return step.label === "Shipped" && order.carrier ? `${formatDate(step.at, timeZone)}, ${carrierName(order.carrier)}` : formatDate(step.at, timeZone);
    if (step.label === "Delivered" && order.estimatedDeliveryDate) return `expected ${formatDay(order.estimatedDeliveryDate)}`;
    return null;
  };

  return (
    <article aria-labelledby="latest-heading" className="relative isolate grid gap-6 overflow-hidden rounded-[28px] border bg-card p-6 sm:p-7">
      <div aria-hidden className="absolute -right-16 -top-20 -z-10 h-[300px] w-[380px] bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--glow-blue)_20%,transparent),transparent_70%)] opacity-(--glow-strength)" />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="grid gap-2.5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">Latest order</p>
          <h2 id="latest-heading" className="flex flex-wrap items-center gap-3.5 font-sans text-[26px] font-semibold tracking-[-0.03em]">
            <span className="font-mono font-medium">#{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </h2>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.placedAtUtc, timeZone)} · {items === 1 ? "1 item" : `${items} items`} ·{" "}
            <span className="font-mono font-medium text-foreground">{formatMoney(order.totalCents)}</span>
          </p>
        </div>
        <div className="flex pl-3.5">
          {order.lines.slice(0, 3).map((line) => (
            <ProductThumb key={line.productId} productId={line.productId} imageUrl={line.imageUrl} sizes="76px" className="-ml-3.5 size-19 rounded-[20px] border-[3px] border-card" />
          ))}
        </div>
      </div>

      <ol aria-label="Progress" className="grid auto-cols-fr grid-flow-col gap-2.5">
        {steps.map((step) => (
          <li key={step.label} className="grid content-start gap-2.5">
            <span aria-hidden className={cn("h-1.5 rounded-full", bars[step.state])} />
            <span className={cn("text-sm", step.state === "upcoming" ? "text-muted-foreground" : "font-semibold")}>
              {step.label}
              <span className="sr-only">{spoken[step.state]}</span>
              {when(step) && (
                <span className="font-normal text-faint max-sm:block">
                  <span className="max-sm:hidden"> · </span>
                  {when(step)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2.5">
        <Link href={`/account/orders/${order.orderNumber}`} className="inline-flex h-11.5 items-center rounded-button bg-primary px-5.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
          Track order<span className="sr-only"> #{order.orderNumber}</span>
        </Link>
        <Link href="/account/orders" className="inline-flex h-11.5 items-center rounded-button border border-foreground/16 px-5 text-[15px] font-medium transition-colors hover:bg-foreground/5">
          All orders
        </Link>
      </div>
    </article>
  );
}
