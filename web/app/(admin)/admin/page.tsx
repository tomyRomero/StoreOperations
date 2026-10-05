import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageOpen, Truck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BarList } from "@/components/admin/dashboard/BarList";
import { RangePicker } from "@/components/admin/dashboard/RangePicker";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { StatTile } from "@/components/admin/dashboard/StatTile";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/types";
import { greeting, parseRange } from "@/lib/dashboard";
import { getDashboard } from "@/lib/data/admin-store";
import { getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";
import { formatDay, orderStatusLabel } from "@/lib/format";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Home" };

const statuses: OrderStatus[] = ["pending", "shipped", "delivered", "cancelled", "refunded"];
const count = (n: number) => n.toLocaleString("en-US");
const cardClasses = "rounded-xl border bg-card p-5 sm:p-6";

// Days are the store's days, in its time zone
export default async function DashboardPage(props: { searchParams: Promise<{ days?: string | string[] }> }) {
  const days = parseRange((await props.searchParams).days);
  const [dashboard, settings, user] = await Promise.all([getDashboard(days), getStoreSettings(), getCurrentUser()]);

  if (!dashboard) {
    return (
      <>
        <AdminPageHeader title="Home" />
        <ErrorState title="We couldn't load the dashboard" action={<RetryButton />} />
      </>
    );
  }

  const { kpis } = dashboard;
  const previous = `the ${days} days before`;
  const byStatus = new Map(dashboard.ordersByStatus.map((s) => [s.status, s.count]));

  return (
    <>
      <AdminPageHeader
        title={`${greeting(new Date(), dashboard.timeZoneId)}${user ? `, ${user.username}` : ""}`}
        description={`Here's how ${settings?.storeName ?? "the store"} did from ${formatDay(dashboard.first)} to ${formatDay(dashboard.last)}, in its time zone (${dashboard.timeZoneId.replace("_", " ")}).`}
      />
      <RangePicker days={days}>
        <div className="grid gap-6 xl:grid-cols-3">
          <section aria-labelledby="sales-heading" className={`${cardClasses} grid gap-6 xl:col-span-2`}>
            <h2 id="sales-heading" className="sr-only">
              Sales
            </h2>
            <StatTile label="Sales" hero comparison={kpis.revenueCents} format={formatMoney} previousPeriod={previous} />
            <SalesChart days={dashboard.revenueByDay} />
            <p className="text-sm text-muted-foreground">Item sales before shipping and tax. Cancelled and refunded orders aren&apos;t counted.</p>
            <details className="group text-sm">
              <summary className="w-fit cursor-pointer font-semibold text-accent underline-offset-4 hover:underline">Show sales as a table</summary>
              <div className="mt-3 max-h-80 overflow-y-auto rounded-sm border">
                <table className="w-full text-left">
                  <caption className="sr-only">Sales per day</caption>
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Day
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        Orders
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.revenueByDay.map((d) => (
                      <tr key={d.date} className="border-t">
                        <th scope="row" className="px-3 py-1.5 font-normal">
                          {formatDay(d.date)}
                        </th>
                        <td className="px-3 py-1.5 text-right tabular-nums">{d.orders}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(d.revenueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <section aria-labelledby="attention-heading" className={`${cardClasses} grid content-start gap-5`}>
            <h2 id="attention-heading" className="text-h4">
              Needs attention
            </h2>
            <Link href="/admin/orders?status=pending" className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                <Truck className="size-5 text-accent-ink" aria-hidden />
              </span>
              <span className="grid flex-1">
                <span className="text-2xl font-semibold">{count(kpis.toShip)}</span>
                <span className="text-sm text-muted-foreground">{kpis.toShip === 1 ? "order" : "orders"} to ship</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/admin/products?stock=low" className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-subtle">
                <PackageOpen className="size-5 text-warning" aria-hidden />
              </span>
              <span className="grid flex-1">
                <span className="text-2xl font-semibold">{count(kpis.lowStock)}</span>
                <span className="text-sm text-muted-foreground">{kpis.lowStock === 1 ? "product" : "products"} low on stock</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            {dashboard.lowStockProducts.length > 0 && (
              <ul className="grid gap-2 text-sm" aria-label="Lowest stock">
                {dashboard.lowStockProducts.map((product) => (
                  <li key={product.productId} className="flex items-center justify-between gap-3">
                    <Link href={`/admin/products/${product.productId}`} className="min-w-0 truncate font-semibold hover:underline">
                      {product.name}
                    </Link>
                    {product.stock === 0 ? (
                      <Badge variant="sale">Sold out</Badge>
                    ) : (
                      <span className="shrink-0 text-muted-foreground tabular-nums">{product.stock} left</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className={`${cardClasses} grid gap-6 sm:grid-cols-3`}>
          <StatTile label="Orders" comparison={kpis.orders} format={count} previousPeriod={previous} />
          <StatTile label="Average order" comparison={kpis.averageOrderCents} format={formatMoney} previousPeriod={previous} />
          <StatTile label="New customers" comparison={kpis.newCustomers} format={count} previousPeriod={previous} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="status-heading" className={`${cardClasses} grid content-start gap-4`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="status-heading" className="text-h4">
                Orders by status
              </h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
                All orders
              </Link>
            </div>
            <BarList
              label="Orders placed in this period, by status now"
              bars={statuses.map((status) => {
                const n = byStatus.get(status) ?? 0;
                return { key: status, label: orderStatusLabel(status), href: `/admin/orders?status=${status}`, value: n, text: count(n) };
              })}
            />
          </section>

          <section aria-labelledby="top-heading" className={`${cardClasses} grid content-start gap-4`}>
            <div className="grid gap-1">
              <h2 id="top-heading" className="text-h4">
                Best sellers
              </h2>
              <p className="text-sm text-muted-foreground">Units sold, with their sales beside each name</p>
            </div>
            {dashboard.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales in this period yet.</p>
            ) : (
              <BarList
                label="Best sellers by units sold in this period"
                bars={dashboard.topProducts.map((product) => ({
                  key: product.productId,
                  label: product.name,
                  href: `/admin/products/${product.productId}`,
                  note: formatMoney(product.revenueCents),
                  value: product.quantity,
                  text: `${count(product.quantity)} sold`,
                }))}
              />
            )}
          </section>
        </div>
      </RangePicker>
    </>
  );
}
