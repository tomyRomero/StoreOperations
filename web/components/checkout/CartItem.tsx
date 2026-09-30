"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/button'
import type { CartLine } from '@/lib/api/types'
import { formatMoney } from '@/lib/money'
import { issueMessage, useCart } from '../cart/CartProvider'
import { toast } from '../ui/use-toast'

// A line of the cart. Quantities change through the cart, which checks stock with the API.
const CartItem = ({ line }: { line: CartLine }) => {
  const cart = useCart();
  const [edit, setEdit] = useState(false);
  const { productId: product, quantity, imageUrl: img } = line;
  const myProduct = { name: line.name };

  const change = async (next: number) => {
    setEdit(true)
    await cart.setQuantity(product, next)
    setEdit(false)
  }

  const add = () => change(quantity + 1)

  // One less; at one, the minus removes the line
  const subtract = () => (quantity > 1 ? change(quantity - 1) : deleteProduct())

  const deleteProduct = async () => {
    setEdit(true)
    if (await cart.remove(product)) {
      toast({ title: "Removed from cart" })
    }
    setEdit(false)
  }

  return (
    <div className="space-y-6 ">
    <div className="flex gap-4 p-4 rounded-lg border">
      <Image
        alt={`${myProduct.name} product picture`}
        className="aspect-square object-cover w-24 h-24 rounded-lg max-sm:w-16 max-sm:h-16"
        height={100}
        src={img}
        width={100}
      />
      <div className="flex-1 grid gap-2">
        <Link href={`/products/${product}`}>
        <h2 className="font-semibold hover:underline hover:text-blue">
          {myProduct.name}
          </h2>
        </Link>
        <h2 className="text-base-regular">Quantity:</h2>
        <div className="flex items-center">
          <Button className='bg-white p-1.5' variant="outline" onClick={subtract} disabled={edit}>
            <Image 
            src="/assets/minus.png"
            alt="subtract icon"
            width={24}
            height={24}
            />
            <span className="sr-only">Subtract</span>
          </Button>
          <h4 className={`px-2 ${edit? "hidden" : ""}`}>{quantity}</h4>
          <Image 
            src="/assets/lineloader.svg"
            alt='loading animation'
            width={24}
            height={24}
            className={`${!edit? "hidden" : "px-2"}`}
          />
          <Button className='bg-white p-1.5' variant="outline" onClick={add} disabled={edit || quantity >= 99}>
            <Image 
            src="/assets/plus.png"
            alt="add icon"
            width={34}
            height={34}
            />
            <span className="sr-only">Add</span>
          </Button>
        </div>
        {line.issue && <div className="text-red-500">{issueMessage(line)}</div>}
        <div className="font-semibold">{formatMoney(line.lineTotalCents)}</div>
      </div>
      <Button  size="icon" variant="outline" onClick={deleteProduct} disabled={edit}>
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