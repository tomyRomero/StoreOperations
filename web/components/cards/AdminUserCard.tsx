import Link from "next/link";
import Image from "next/image";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import AccountAccessButton from "../forms/AccountAccessButton";
import OrderStatusBadge from "../shared/OrderStatusBadge";
import type { AdminCustomer } from "@/lib/api/types";
import { addressLines, formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";

// One account: who it is, where it ships, what it has bought, and whether it can sign in
const AdminUserCard = ({ customer, timeZone }: { customer: AdminCustomer; timeZone: string }) => {
  return (
    <>
    <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
      <Link href="/adminusers">
        <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
        <span className="ml-2">Go Back</span>
      </Link>
    </Button>
    <Card className="mt-6">
    <CardHeader className="flex flex-row flex-wrap items-start gap-4 space-y-0">
      <div className="grid gap-1.5">
        <CardTitle className="flex flex-wrap items-center gap-2">
          {customer.username}
          {customer.isAdmin && <Badge variant="accent">Admin</Badge>}
          {customer.isDisabled && <Badge variant="sale">Disabled</Badge>}
        </CardTitle>
        <CardDescription>{customer.email}</CardDescription>
      </div>
      <div className="ml-auto">
        <AccountAccessButton customer={customer} />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <dl className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <dt className="font-semibold">Joined</dt>
          <dd>{formatDate(customer.joinedAtUtc, timeZone)}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-semibold">Account id</dt>
          <dd>{customer.id}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-semibold">Orders</dt>
          <dd>{customer.orderCount}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-semibold">Spent</dt>
          <dd>{formatMoney(customer.spentCents)}</dd>
        </div>
      </dl>
      <Separator />
      <div>
        <h2 className="font-semibold mb-2">Shipping addresses</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-gray-500">None saved.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <li key={address.id}>
                <div className="font-medium">
                  {address.recipientName}{address.isDefault && <span className="ml-2 text-gray-500">(default)</span>}
                </div>
                {addressLines(address).map((line) => <div key={line}>{line}</div>)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Separator />
      <div>
        <div className="flex items-center mb-2">
          <h2 className="font-semibold">Latest orders</h2>
          {customer.orderCount > 0 && (
            <Link className="ml-auto underline" href={`/adminorders?customer=${customer.id}`}>All orders</Link>
          )}
        </div>
        {customer.recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <ul className="grid gap-2">
            {customer.recentOrders.map((order) => (
              <li key={order.orderNumber} className="flex flex-wrap items-center gap-4">
                <Link className="font-medium underline" href={`/adminorders/${order.orderNumber}`}>#{order.orderNumber}</Link>
                <OrderStatusBadge status={order.status} />
                <span>{formatMoney(order.totalCents)}</span>
                <span className="text-gray-500">{formatDate(order.placedAtUtc, timeZone)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardContent>
  </Card>
  </>
  )
}

export default AdminUserCard
