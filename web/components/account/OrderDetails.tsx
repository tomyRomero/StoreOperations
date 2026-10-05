import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { BuyAgainButton } from "./BuyAgainButton";
import { OrderTimeline } from "./OrderTimeline";
import { OrderLines, OrderTotals } from "../checkout/OrderLines";
import { CopyButton } from "../shared/CopyButton";
import { OrderStatusBadge } from "../shared/OrderStatusBadge";
import type { Order } from "@/lib/api/types";
import { addressLines, carrierName, formatDate, formatDay, orderStatusLabel } from "@/lib/format";

// The big line at the top of the progress card: when it arrived, when it should, or where it is
function headline(order: Order, timeZone: string): { label: string; value: string } {
  const delivered = order.timeline.findLast((step) => step.status === "delivered");
  if (order.status === "delivered" && delivered) return { label: "Delivered", value: formatDate(delivered.changedAtUtc, timeZone) };
  if ((order.status === "pending" || order.status === "shipped") && order.estimatedDeliveryDate) return { label: "Expected", value: formatDay(order.estimatedDeliveryDate) };
  return { label: "Status", value: order.status === "shipped" ? "On its way" : orderStatusLabel(order.status) };
}

// One order as its buyer sees it, in a customer's account or behind a guest's private link. `aside` goes
// above the help card, beside the items.
export function OrderDetails({ order, timeZone, aside }: { order: Order; timeZone: string; aside?: ReactNode }) {
  const ended = order.status === "cancelled" || order.status === "refunded";
  const lastNote = [...order.timeline].reverse().find((step) => step.note)?.note;
  const top = headline(order, timeZone);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-[36px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">
              Order <span className="font-mono font-medium tracking-[-0.02em]">#{order.orderNumber}</span>
            </h1>
            <OrderStatusBadge status={order.status} className="h-8 px-3.5 text-sm" />
          </div>
          <p className="text-[15px] text-muted-foreground">Placed {formatDate(order.placedAtUtc, timeZone)}</p>
        </div>
        <BuyAgainButton lines={order.lines} />
      </div>

      <section aria-labelledby="progress-heading" className="relative isolate grid gap-7 overflow-hidden rounded-[28px] border bg-card p-6 sm:p-7">
        <div aria-hidden className="absolute -right-20 -top-24 -z-10 h-[300px] w-[420px] bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--glow-blue)_16%,transparent),transparent_70%)] opacity-(--glow-strength)" />
        <h2 id="progress-heading" className="sr-only">
          Progress
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <p className="grid gap-1.5">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">{top.label}</span>
            <span className="text-[26px] font-semibold tracking-[-0.04em] sm:text-[30px]">{top.value}</span>
          </p>
          {order.trackingNumber && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] border bg-foreground/[0.03] py-2.5 pl-4 pr-2.5">
              <p className="grid gap-0.5">
                <span className="text-xs text-faint">{order.carrier ? `${carrierName(order.carrier)} tracking` : "Tracking"}</span>
                <span className="font-mono text-sm font-medium">{order.trackingNumber}</span>
              </p>
              <CopyButton value={order.trackingNumber} label="Copy the tracking number" />
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1 rounded-button bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  Track {order.carrier && order.carrier !== "other" ? `on ${carrierName(order.carrier)}` : "package"}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  <span className="sr-only"> (opens the carrier&apos;s site)</span>
                </a>
              )}
            </div>
          )}
        </div>
        <OrderTimeline order={order} timeZone={timeZone} />
        {ended && (
          <p className="rounded-[16px] bg-foreground/5 p-4 text-sm">
            {order.status === "cancelled" ? "This order was cancelled" : "This order was refunded"}, and the payment was returned in full.
            {lastNote ? ` ${lastNote}` : ""}
          </p>
        )}
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="items-heading" className="grid gap-4.5 rounded-[28px] border bg-card p-6 sm:p-7">
          <h2 id="items-heading" className="font-sans text-lg font-semibold">
            Items
          </h2>
          <OrderLines lines={order.lines} />
          <OrderTotals totals={order} state={order.shipTo.state} totalLabel="Total paid" />
        </section>
        <div className="grid gap-4">
          {aside}
          <section aria-labelledby="ship-heading" className="grid gap-2.5 rounded-[24px] border bg-card p-6">
            <h2 id="ship-heading" className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">
              Shipping to
            </h2>
            <p className="text-[15px] leading-relaxed">
              {order.shipTo.recipientName}
              {addressLines(order.shipTo).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </section>
          <section aria-labelledby="help-heading" className="grid gap-2.5 rounded-[24px] border bg-linear-135 from-glow-violet/12 to-card to-70% p-6">
            <h2 id="help-heading" className="font-sans text-base font-semibold">
              Something not right?
            </h2>
            <p className="text-sm leading-normal text-muted-foreground">
              If it arrives damaged or isn&apos;t what you ordered, write to us with order #{order.orderNumber} and we&apos;ll sort it out.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-accent hover:underline">
              Contact us
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
