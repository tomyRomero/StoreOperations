"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import CartItem from "./CartItem";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Cart = () => {
  const [total, setTotal] = useState()

  const router = useRouter()

  const goBack = ()=> {
    router.back();
  }

  return (
      <div>
          <div className="flex">
            <h1 className="text-heading3-bold font-semibold mb-6">Cart</h1>
            <Image
            src="/assets/cart.png"
            alt="cart icon"
            width={28}
            height={28}
            className="px-1 w-8 h-6 align-middle mt-2"
          />
          </div>
        <div className="flex mb-4">
         <Button className="flex px-2 border border-black" variant="ghost" onClick={goBack}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:gap-8">

          {/* Cart Items */}
          <div className="flex flex-col gap-2">
          <CartItem />
          </div>


          {/* Total Section */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h2 className="font-semibold text-heading4-bold text-lg mb-4">Summary:</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-medium">$179.98</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Total:</span>
                <span className="font-medium">$189.98</span>
              </div>
              <Button className="w-full">Checkout</Button>
            </div>
            <div className="py-0.5">
            <Link className="text-sm hover:underline" href="/products" >
              Continue Shopping
            </Link>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Cart;