import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import OrderStatusBadge from "@/components/shared/OrderStatusBadge"
import type { AdminOrderSummary } from "@/lib/api/types"
import { formatDate } from "@/lib/format"
import { formatMoney } from "@/lib/money"

export const OrderRow = ({ order, timeZone }: { order: AdminOrderSummary; timeZone: string }) => {
  return (
    <TableRow>
    <TableCell>
      <Button asChild className="bg-black text-white border border-black" variant="ghost">
        <Link href={`/adminorders/${order.orderNumber}`}>
          View<span className="sr-only"> order {order.orderNumber}</span>
        </Link>
      </Button>
    </TableCell>
    <TableCell>#{order.orderNumber}</TableCell>
    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
    <TableCell><p className="text-green-600">{formatMoney(order.totalCents)}</p></TableCell>
    <TableCell className="text-center">{order.itemCount}</TableCell>
    <TableCell>
      <div>{order.customerName}</div>
      <div className="text-gray-500">{order.customerEmail}</div>
    </TableCell>
    <TableCell>{formatDate(order.placedAtUtc, timeZone)}</TableCell>
  </TableRow>
  )
}
