import React from 'react'
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table"
import OrderLineRow from '../tables/OrderLineRow'
import type { Order } from '@/lib/api/types'
import { addressLines, carrierName, formatDate, formatDay, orderStatusLabel } from '@/lib/format'
import { formatMoney } from '@/lib/money'

// Everything about one of the customer's orders: what they bought, what they paid, where it's going
const CustomerOrderDetailsCards = ({ order, timeZone }: { order: Order; timeZone: string }) => {
  const summary = [
    ["Order number", `#${order.orderNumber}`],
    ["Date", formatDate(order.placedAtUtc, timeZone)],
    ["Subtotal", formatMoney(order.subtotalCents)],
    ["Shipping", formatMoney(order.shippingCents)],
    ["Tax", formatMoney(order.taxCents)],
    ["Total", formatMoney(order.totalCents)],
    ["Status", orderStatusLabel(order.status)],
  ];

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
            {summary.map(([label, value]) => (
              <div className="flex items-center" key={label}>
                <dt className="font-bold text-black">{label}:</dt>
                <dd className="ml-auto font-medium">{value}</dd>
              </div>
            ))}
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
              <dd className="ml-auto font-medium">
                {order.estimatedDeliveryDate ? formatDay(order.estimatedDeliveryDate) : "Not shipped yet"}
              </dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="font-bold text-black">Tracking:</dt>
              <dd className="ml-auto font-medium">
                {!order.trackingNumber
                  ? "Not shipped yet"
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
                {step.note && <p className="w-full">{step.note}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerOrderDetailsCards;
