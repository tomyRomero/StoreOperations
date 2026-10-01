import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { storeDetails } from '@/lib/constants'

const OrderSuccess = ({ orderNumber, supportEmail }: { orderNumber: string; supportEmail: string | null }) => {
  return (
    <>
    <div className="mx-auto max-w-2xl p-4 bg-white rounded-lg shadow-md">
    <div className="flex items-center justify-center space-x-2">
      <Image
        src={"/assets/checkmark.png"}
        alt={"checkmark logo"}
        width={34}
        height={34}
      />
      <h1 className="text-2xl font-semibold">Purchase Successful!</h1>
    </div>
    <p className="mt-2 text-center text-gray-600">
      Thank you for your purchase. Your order number is <span className="font-semibold">#{orderNumber}</span>.
    </p>
  </div>
  <div className="mx-auto max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-md">
    <h2 className="text-xl font-semibold">Store Information</h2>
    <div className="mt-4 space-y-2">
      <div className="flex items-start justify-between">
        <span className="text-gray-600">Store Address:</span>
        <span className="font-medium">
         {storeDetails.location}
        </span>
      </div>
      <div className="flex items-start justify-between">
        <span className="text-gray-600">Contact Information:</span>
        <span className="font-medium">
          Phone: {storeDetails.contact}
          {supportEmail && (<><br />Email: {supportEmail}</>)}
        </span>
      </div>
      <div className="flex items-start justify-between">
        <span className="text-gray-600">Store Hours:</span>
        <span className="font-medium">
          Monday - Friday: {storeDetails.hours.mondayToFriday}
          <br />
          Saturday: {storeDetails.hours.saturday}
          <br />
          Sunday: {storeDetails.hours.sunday}
        </span>
      </div>
    </div>
  </div>
  <p className="mt-4 text-center text-gray-600">
    A confirmation email has been sent to your email address.
  </p>
  <div className="flex flex-wrap gap-4 justify-center">
    <Link href="/products">
    <Button className="mt-8 max-w-md h-12 bg-black text-white border border-black" variant={"ghost"}>
      Continue Shopping
    </Button>
    </Link>
    <Link href={`/account/orders/${orderNumber}`}>
    <Button className="mt-8 max-w-md h-12 bg-black text-white border border-black" variant={"ghost"}>
      View Order
    </Button>
    </Link>
  </div>
  </>
  )
}

export default OrderSuccess