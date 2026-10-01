import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { OrderLines, OrderTotals } from "@/components/checkout/OrderLines";
import { CopyButton } from "@/components/shared/CopyButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { getOrder } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { addressLines, carrierName, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: `Order #${(await props.params).id}` };
}

// One of the customer's orders: where it is, what's in it, where it's going. Another customer's order
// number simply isn't found.
export default async function OrderPage(props: Props) {
  const { id } = await props.params;
  const [order, settings] = await Promise.all([getOrder(id), getStoreSettings()]);
  if (!settings) {
    return (
      <ErrorState
        title="We couldn't load this order"
        action={<RetryButton />}
      />
    );
  }
  if (!order) notFound();

  const ended = order.status === "cancelled" || order.status === "refunded";
  const lastNote = [...order.timeline].reverse().find((step) => step.note)?.note;

  return (
    <div className="grid gap-8">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-h1">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed {formatDate(order.placedAtUtc, settings.timeZoneId)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section aria-labelledby="progress-heading" className="grid gap-5 rounded-md border p-5 sm:p-6">
        <h2 id="progress-heading" className="sr-only">
          Progress
        </h2>
        <OrderTimeline order={order} timeZone={settings.timeZoneId} />
        {ended && (
          <p className="rounded-md bg-destructive-subtle p-3 text-sm">
            {order.status === "cancelled" ? "This order was cancelled" : "This order was refunded"}, and the payment was returned in full.
            {lastNote ? ` ${lastNote}` : ""}
          </p>
        )}
        {order.trackingNumber && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-4 text-sm">
            <span className="text-muted-foreground">{order.carrier ? carrierName(order.carrier) : "Tracking"}</span>
            <span className="font-semibold tabular-nums">{order.trackingNumber}</span>
            <CopyButton value={order.trackingNumber} label="Copy the tracking number" />
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-accent underline-offset-4 hover:underline"
              >
                Track package
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only"> (opens the carrier&apos;s site)</span>
              </a>
            )}
          </div>
        )}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-labelledby="items-heading" className="grid gap-5 rounded-md border p-5 sm:p-6">
          <h2 id="items-heading" className="text-h3">
            Items
          </h2>
          <OrderLines lines={order.lines} />
          <OrderTotals totals={order} />
        </section>
        <section aria-labelledby="ship-heading" className="grid gap-1 rounded-md border p-5 text-sm sm:p-6">
          <h2 id="ship-heading" className="mb-2 text-h3">
            Shipping to
          </h2>
          <p className="font-semibold">{order.shipTo.recipientName}</p>
          {addressLines(order.shipTo).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      </div>
    </div>
  );
}
