import React from 'react'
import Link from 'next/link'
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table"
import OrderLineRow from '../tables/OrderLineRow'
import OrderStatusBadge from '../shared/OrderStatusBadge'
import type { AdminOrder } from '@/lib/api/types'
import { addressLines, carrierName, formatDate, formatDay, orderStatusLabel } from '@/lib/format'
import { formatMoney } from '@/lib/money'

// An order as the store sees it: the customer, the payment, what to ship where, and who changed what
const OrderDetailsCards = ({ order, timeZone }: { order: AdminOrder; timeZone: string }) => {
  const amounts = [
    ["Subtotal", order.subtotalCents],
    ["Shipping", order.shippingCents],
    ["Tax", order.taxCents],
    ["Total", order.totalCents],
  ] as const;

  return (
    <div className='grid grid-cols-1 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Items Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]"><span className="sr-only">Image</span></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines.map((line) => (
                <OrderLineRow key={line.productId} line={line} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-heading3-bold'>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2">
            <div className="flex items-center">
              <dt className="font-bold text-black">Customer:</dt>
              <dd className="ml-auto text-right font-medium">
                <Link className="underline hover:text-blue" href={`/adminusers/${order.customerId}`}>{order.customerName}</Link>
                <div className="text-gray-500">{order.customerEmail}</div>
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="font-bold text-black">Order number:</dt>
              <dd className="ml-auto font-medium">#{order.orderNumber}</dd>
            </div>
            <div className="flex items-center">
              <dt className="font-bold text-black">Placed:</dt>
              <dd className="ml-auto font-medium">{formatDate(order.placedAtUtc, timeZone)}</dd>
            </div>
            {amounts.map(([label, cents]) => (
              <div className="flex items-center" key={label}>
                <dt className="font-bold text-black">{label}:</dt>
                <dd className="ml-auto font-medium">{formatMoney(cents)}</dd>
              </div>
            ))}
            <div className="flex items-center">
              <dt className="font-bold text-black">Status:</dt>
              <dd className="ml-auto"><OrderStatusBadge status={order.status} /></dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="font-bold text-black">Payment:</dt>
              <dd className="ml-auto min-w-0 truncate font-medium">
                {/* Payments are test mode only, so the link opens Stripe's test dashboard */}
                <a className="underline" href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`} target="_blank" rel="noopener noreferrer">
                  {order.stripePaymentIntentId}
                </a>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <div className="flex gap-14">
              <dt className="font-bold text-black">Address:</dt>
              <dd className="ml-auto text-right font-medium">
                <div>{order.shipTo.recipientName}</div>
                {addressLines(order.shipTo).map((line) => <div key={line}>{line}</div>)}
              </dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="font-bold text-black">Estimated delivery:</dt>
              <dd className="ml-auto font-medium">{order.estimatedDeliveryDate ? formatDay(order.estimatedDeliveryDate) : "Not set"}</dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="font-bold text-black">Tracking:</dt>
              <dd className="ml-auto font-medium">
                {!order.trackingNumber
                  ? "Not set"
                  : order.trackingUrl
                    ? <a className="underline" href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                        {order.carrier ? `${carrierName(order.carrier)} ` : ""}{order.trackingNumber}
                      </a>
                    : `${order.carrier ? `${carrierName(order.carrier)} ` : ""}${order.trackingNumber}`}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3">
            {order.timeline.map((step) => (
              <li key={`${step.status}-${step.changedAtUtc}`} className="flex flex-wrap gap-x-4">
                <span className="font-bold">{orderStatusLabel(step.status)}</span>
                <span className="text-gray-500">{formatDate(step.changedAtUtc, timeZone)}</span>
                <span className="text-gray-500">{step.changedBy ? `by ${step.changedBy}` : "by the store"}</span>
                {step.note && <p className="w-full">{step.note}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetailsCards;
