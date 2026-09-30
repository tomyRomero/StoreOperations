"use client"

import React from 'react'
import { CardContent } from '../ui/card'
import { Button } from '../ui/button'
import Link from 'next/link';

interface Props{
    orderId: string;
    items: {
        productName: string;
        quantity: number;
    }[];
    date: string;
    status: string;
    tracking: string;
    pricing: {
      total: string;
      subtotal: string;
      taxAmount: string;
      shipping: string;
      taxtId: string;
    };
}

const CustomerOrder = ({orderId , items, date, status, tracking, pricing} : Props) => {

  return (
    <div className='w-full'>
    <CardContent className="p-4 max-md:p-2 max-sm:p-1">
    <div className="grid gap-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center p-4">
          <div className="font-bold flex-wrap">Order #{orderId}</div>
          <div className="px-3 ml-auto text-gray-500 ">{status}</div>
        </div>
        <div className="border-t" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start p-4 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <div className="font-bold">Items</div>
            <div className="grid max-sm:grid-cols-1 grid-cols-2 gap-2">
            {items.map((item, index)=> (
                  <div className="flex items-center gap-2" key={index}>
                    <div className="grid gap-0.5">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500">x{item.quantity}</div>
                    </div>
                  </div>
            ))}
             </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold">Order Date</div>
            <div>{date}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold">Order Total</div>
            <div>${pricing.total}</div>
          </div>
        </div>
        <div className="border-t" />
        <div className="flex max-sm:flex-col items-center p-4">
          <h1>
            Track Order:{tracking ? tracking : "Has Not Shipped"}
          </h1>
          <Link href={`/account/orders/${orderId}`} className='ml-auto'>
          <Button className="bg-black text-white border border-black"  variant="ghost">
            View details
          </Button>
          </Link>
        </div>
      </div>
    </div>
  </CardContent>
  </div>
  )
}

export default CustomerOrder