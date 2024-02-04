"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import CartItem from "./CartItem";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/(auth)/loading";
import { useSession } from "next-auth/react";
import { getCartItems } from "@/lib/actions/store.actions";
import { useAppContext } from "@/lib/AppContext";

interface cartItem {
  product: string;
  quantity: number;

}

const Cart = () => {
  const [cartItems, setCartItems] = useState<cartItem[]>([])
  const [subtotals, setSubtotals] = useState<number[]>(
    Array.from({ length: cartItems.length }, () => 0)
  );;
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false);
  const [update , setUpdate] = useState(false);

  const router = useRouter()
  const { data: session } = useSession();

  const goBack = ()=> {
    router.back();
  }
  const { cart } = useAppContext();

  const updateTotal = (index: number, subTotal: number) => {
    
    subtotals[index] = subTotal

    // Calculate the total by summing up all subtotals
    const newTotal = subtotals.reduce((acc, subtotal) => acc + subtotal, 0);
    setTotal(newTotal);
  };

  useEffect(()=> {
    const getProducts = async ()=> {
      if(session)
      {
        //If User is logged in check database for the cart
        const serverCart = await getCartItems(session.user.id)
        setCartItems(serverCart)
      }else{
         // If user is not logged, check localStorage
         const localStorageCartString = localStorage.getItem('cart');
         if (localStorageCartString) {
           // If localStorage has cart data, parse it and set cartItems
           const localStorageCart = JSON.parse(localStorageCartString);
           setCartItems(localStorageCart)
          
         }else{
          // If localStorage is empty check the cart global state as a final check
          setCartItems(cart)
         }
      }

      setLoading(true)
      }

      getProducts();   
    }

  , [update])
  //added update dependency incase an product gets removed from cart i can refetch products to reflect the update 


  return (
    <>
    {loading ? (  <div >
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
          {cartItems.map((cartItem, index) => (
            <CartItem key={cartItem.product} product={cartItem.product} quantity={cartItem.quantity} updateTotal={updateTotal} index={index} update={update} setUpdate={setUpdate}/>
          ))}

          {cartItems.length === 0 && 
            <h1 className="p-4 text-heading2-bold">Cart is empty</h1>
          }
          </div>


          {/* Total Section */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h2 className="font-semibold text-heading4-bold text-lg mb-4">Summary:</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Total:</span>
                <span className="font-medium">${(total > 0 ? (total + 10.00) : (0)).toFixed(2)}</span>
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
      </div>) : (
        <Loading />        
      )}


      </>
  )
}

export default Cart;