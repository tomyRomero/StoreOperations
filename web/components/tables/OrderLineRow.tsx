import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TableRow, TableCell } from "@/components/ui/table"
import type { OrderLine } from '@/lib/api/types'
import { formatMoney } from '@/lib/money'

// One line of an order, at the price the customer paid
const OrderLineRow = ({ line }: { line: OrderLine }) => {
  return (
    <TableRow>
    <TableCell>
      <Image
        alt=""
        className="aspect-square rounded-md object-cover"
        height="85"
        src={line.imageUrl}
        width="85"
      />
    </TableCell>
    <TableCell className="font-medium">
      <Link href={`/products/${line.productId}`} className="hover:underline">{line.name}</Link>
    </TableCell>
    <TableCell>{line.quantity}</TableCell>
    <TableCell>{formatMoney(line.unitPriceCents)}</TableCell>
    <TableCell>{formatMoney(line.lineTotalCents)}</TableCell>
  </TableRow>
  )
}

export default OrderLineRow
