"use client"

import React, {useState, useEffect} from 'react'
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const CartItem = () => {
  return (
    <div className="space-y-6 ">
    <div className="flex gap-4 p-4 rounded-lg border">
      <Image
        alt="Product 1"
        className="aspect-square object-cover w-24 h-24 rounded-lg"
        height={100}
        src="/assets/art.jpg"
        width={100}
      />
      <div className="flex-1 grid gap-2">
        <h2 className="font-semibold">Product 1</h2>
        <h2 className="text-base-regular">Quantity:</h2>
        <div className="flex items-center">
          <Button className='bg-white p-1.5' variant="outline">
            <Image 
            src="/assets/minus.png"
            alt="subtract icon"
            width={24}
            height={24}
            />
          </Button>
          <h4 className='px-2'>1</h4>
          <Button className='bg-white p-1.5' variant="outline">
            <Image 
            src="/assets/plus.png"
            alt="add icon"
            width={24}
            height={24}
            />
          </Button>
        </div>
        <div className="text-lg font-semibold">$99.99</div>
      </div>
      <Button  size="icon" variant="outline">
        <Image 
        src="/assets/delete.png"
        alt="trash icon"
        width={24}
        height={24}
        />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  </div>
  )
}

export default CartItem