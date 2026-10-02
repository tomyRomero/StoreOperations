import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderUpdateForm } from "@/components/admin/orders/OrderUpdateForm";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { getAdminOrder } from "@/lib/data/admin-orders";
import { getAdminSettings } from "@/lib/data/admin-store";
import { addressLines, carrierName, formatDate, formatDay, orderStatusLabel } from "@/lib/format";
import { formatMoney } from "@/lib/money";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: `Order #${(await props.params).orderNumber}` };
}

const card = "rounded-xl border bg-card p-5";

export default async function AdminOrderPage(props: Props) {
  const { orderNumber } = await props.params;
  const [order, settings] = await Promise.all([getAdminOrder(orderNumber), getAdminSettings()]);
  if (!order || !settings) notFound();

  const timeZone = settings.timeZoneId;
  const amounts = [
    ["Subtotal", order.subtotalCents],
    ["Shipping", order.shippingCents],
    ["Tax", order.taxCents],
  ] as const;

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/orders", label: "All orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order #{order.orderNumber}
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={`Placed ${formatDate(order.placedAtUtc, timeZone)} by ${order.customerName}`}
        actions={
          // Payments run in Stripe's test mode only, so this opens the test dashboard
          <Button asChild variant="outline">
            <a href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`} target="_blank" rel="noopener noreferrer">
              View payment in Stripe
              <ExternalLink aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          <section aria-labelledby="items-heading" className={card}>
            <h2 id="items-heading" className="mb-4 text-h4">
              Items
            </h2>
            <ul className="divide-y">
              {order.lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-4 py-3 first:pt-0">
                  <Image src={line.imageUrl} alt="" width={56} height={56} className="aspect-square shrink-0 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${line.productId}`} className="font-semibold hover:underline">
                      {line.name}
                    </Link>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {line.quantity} × {formatMoney(line.unitPriceCents)}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatMoney(line.lineTotalCents)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid gap-1.5 border-t pt-4 text-sm">
              {amounts.map(([label, cents]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="tabular-nums">{formatMoney(cents)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="history-heading" className={card}>
            <h2 id="history-heading" className="mb-4 text-h4">
              History
            </h2>
            <ol className="grid gap-4 border-l pl-5">
              {order.timeline.map((step) => (
                <li key={`${step.status}-${step.changedAtUtc}`} className="relative grid gap-0.5">
                  <span aria-hidden className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-card bg-foreground" />
                  <p className="font-semibold">{orderStatusLabel(step.status)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(step.changedAtUtc, timeZone)}, {step.changedBy ? `by ${step.changedBy}` : "by the store"}
                  </p>
                  {step.note && <p className="mt-1 rounded-sm bg-muted px-3 py-2 text-sm">{step.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section aria-labelledby="update-heading" className={card}>
            <h2 id="update-heading" className="mb-4 text-h4">
              Update order
            </h2>
            {/* A new version of the order (after a save or a conflict) starts the form again from it */}
            <OrderUpdateForm key={order.rowVersion} order={order} emailByDefault={settings.emailCustomerOnStatusUpdateByDefault} />
          </section>

          <section aria-labelledby="customer-heading" className={`${card} grid gap-1 text-sm`}>
            <h2 id="customer-heading" className="mb-2 text-h4">
              Customer
            </h2>
            <Link href={`/admin/customers/${order.customerId}`} className="font-semibold hover:underline">
              {order.customerName}
            </Link>
            <a href={`mailto:${order.customerEmail}`} className="text-muted-foreground hover:underline">
              {order.customerEmail}
            </a>
            <Link href={`/admin/orders?customer=${order.customerId}`} className="mt-2 font-semibold text-accent underline-offset-4 hover:underline">
              All their orders
            </Link>
          </section>

          <section aria-labelledby="ship-heading" className={`${card} grid gap-1 text-sm`}>
            <h2 id="ship-heading" className="mb-2 text-h4">
              Ship to
            </h2>
            <address className="not-italic">
              <span className="font-semibold">{order.shipTo.recipientName}</span>
              {addressLines(order.shipTo).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            {(order.trackingNumber || order.estimatedDeliveryDate) && (
              <dl className="mt-3 grid gap-1 border-t pt-3">
                {order.trackingNumber && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tracking</dt>
                    <dd className="min-w-0 truncate">
                      {order.trackingUrl ? (
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">
                          {order.carrier ? `${carrierName(order.carrier)} ` : ""}
                          {order.trackingNumber}
                        </a>
                      ) : (
                        `${order.carrier ? `${carrierName(order.carrier)} ` : ""}${order.trackingNumber}`
                      )}
                    </dd>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Expected</dt>
                    <dd>{formatDay(order.estimatedDeliveryDate)}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
