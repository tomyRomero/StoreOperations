import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { CardContent } from '../ui/card'
import { Button } from '../ui/button'
import type { OrderSummary } from '@/lib/api/types';
import { formatDate, orderStatusLabel } from '@/lib/format';
import { formatMoney } from '@/lib/money';

// One order in the customer's history
const CustomerOrder = ({ order, timeZone }: { order: OrderSummary; timeZone: string }) => {
  return (
    <div className='w-full'>
    <CardContent className="p-4 max-md:p-2 max-sm:p-1">
      <div className="border rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center p-4">
          <div className="font-bold flex-wrap">Order #{order.orderNumber}</div>
          <div className="px-3 ml-auto text-gray-500">{orderStatusLabel(order.status)}</div>
        </div>
        <div className="border-t" />
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] items-center p-4 gap-4 text-sm">
          {order.imageUrl && (
            <Image
              src={order.imageUrl}
              alt=""
              width={64}
              height={64}
              className="aspect-square rounded-md object-cover max-md:hidden"
            />
          )}
          <div className="flex flex-col gap-1">
            <div className="font-bold">Items</div>
            <div>{order.itemCount}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold">Order Date</div>
            <div>{formatDate(order.placedAtUtc, timeZone)}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold">Order Total</div>
            <div>{formatMoney(order.totalCents)}</div>
          </div>
        </div>
        <div className="border-t" />
        <div className="flex p-4">
          <Button asChild className="ml-auto bg-black text-white border border-black" variant="ghost">
            <Link href={`/account/orders/${order.orderNumber}`}>View details</Link>
          </Button>
        </div>
      </div>
    </CardContent>
    </div>
  )
}

export default CustomerOrder
