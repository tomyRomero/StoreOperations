import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AccountAccessButton } from "@/components/admin/customers/AccountAccessButton";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminCustomer } from "@/lib/data/admin-customers";
import { getAdminSettings } from "@/lib/data/admin-store";
import { addressLines, formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";

type Props = { params: Promise<{ id: string }> };

async function customerFor(props: Props) {
  const id = Number((await props.params).id);
  return Number.isInteger(id) && id > 0 ? getAdminCustomer(id) : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: (await customerFor(props))?.username ?? "Customer" };
}

const card = "rounded-xl border bg-card p-5 sm:p-6";

export default async function CustomerPage(props: Props) {
  const [customer, settings] = await Promise.all([customerFor(props), getAdminSettings()]);
  if (!customer || !settings) notFound();

  const timeZone = settings.timeZoneId;
  const figures = [
    ["Orders", String(customer.orderCount)],
    ["Spent", formatMoney(customer.spentCents)],
    ["Account id", String(customer.id)],
  ] as const;

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/customers", label: "All customers" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {customer.username}
            {customer.isAdmin && <Badge variant="accent">Admin</Badge>}
            {customer.isDisabled && <Badge variant="sale">Disabled</Badge>}
          </span>
        }
        description={`${customer.email} · joined ${formatDate(customer.joinedAtUtc, timeZone)}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <a href={`mailto:${customer.email}`}>
                <Mail aria-hidden />
                Email
              </a>
            </Button>
            <AccountAccessButton customer={customer} />
          </>
        }
      />

      <dl className={`${card} mb-6 grid gap-6 sm:grid-cols-3`}>
        {figures.map(([label, value]) => (
          <div key={label} className="grid gap-1">
            <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">Spent adds up the orders that weren&apos;t cancelled or refunded, shipping and tax included.</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="orders-heading" className={`${card} self-start`}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="orders-heading" className="text-h4">
              Latest orders
            </h2>
            {customer.orderCount > 0 && (
              <Link href={`/admin/orders?customer=${customer.id}`} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
                All {customer.orderCount} orders
              </Link>
            )}
          </div>
          {customer.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y">
              {customer.recentOrders.map((order) => (
                <li key={order.orderNumber} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="font-semibold hover:underline">
                    #{order.orderNumber}
                  </Link>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm text-muted-foreground">{formatDate(order.placedAtUtc, timeZone)}</span>
                  <span className="ml-auto font-semibold tabular-nums">{formatMoney(order.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="addresses-heading" className={`${card} self-start`}>
          <h2 id="addresses-heading" className="mb-4 text-h4">
            Addresses
          </h2>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">None saved.</p>
          ) : (
            <ul className="grid gap-4 text-sm">
              {customer.addresses.map((address) => (
                <li key={address.id}>
                  <address className="not-italic">
                    <span className="flex items-center gap-2 font-semibold">
                      {address.recipientName}
                      {address.isDefault && <Badge variant="neutral">Default</Badge>}
                    </span>
                    {addressLines(address).map((line) => (
                      <span key={line} className="block text-muted-foreground">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
