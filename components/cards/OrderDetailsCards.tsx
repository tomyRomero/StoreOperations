import React from 'react'
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import Image from 'next/image'
import { Order } from '@/app/types/global'
import OrderDetailsCardRow from '../tables/OrderDetailsCardRow'



const OrderDetailsCards = ({pricing, address, status, items, orderId, user, date, trackingNumber, deliveryDate}: Order) => {

  console.log("items:" ,items)

  return (
        <div className='grid grid-cols-1'>
           <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Order:</div>
            <div className="ml-auto font-medium">#{orderId}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Date:</div>
            <div className="ml-auto font-medium">{date}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Shipping:</div>
            <div className="ml-auto font-medium">${pricing.shipping}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Subtotal:</div>
            <div className="ml-auto font-medium">${pricing.subtotal}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Tax:</div>
            <div className="ml-auto font-medium">${pricing.taxAmount}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Tax ID:</div>
            <div className="ml-auto font-medium">{pricing.taxtId}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Total:</div>
            <div className="ml-auto font-medium">{pricing.total}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-gray-500 dark:text-gray-400">Status:</div>
            <div className="ml-auto font-medium">{status === "pending" ? (<p className='text-red-500 font-extrabold'>Customer Awaiting Your Shipment</p>) : status}</div>
          </div>
        </CardContent>
      </Card>
      <br></br>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-14">
            <div className="font-bold text-gray-500 dark:text-gray-400">Address:</div>
            <div className="ml-auto font-medium flex flex-wrap">
            {`${address.name} - ${address.address.line1}, ${address.address.city}, ${address.address.country}`}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-bold text-gray-500 dark:text-gray-400">Estimated delivery:</div>
            <div className="ml-auto font-medium">{deliveryDate ? deliveryDate : "Click on Update to Change Once You Have Shipped"}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-bold text-gray-500 dark:text-gray-400">Tracking number:</div>
            <div className="ml-auto font-medium">{trackingNumber ? trackingNumber : "Click on Update to Change Once You Have Shipped"}</div>
          </div>
        </CardContent>
      </Card>
      <br></br>
      <Card>
        <CardHeader>
          <CardTitle>Items Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Image</TableHead>
                <TableHead className="max-w-[150px]">Product ID</TableHead>
                <TableHead className="max-w-[150px]">Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <OrderDetailsCardRow key={item._id.toString()} product={item.product} quantity={item.quantity}/>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}

export default OrderDetailsCards;