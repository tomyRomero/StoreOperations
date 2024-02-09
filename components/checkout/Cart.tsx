"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import CartItem from "./CartItem";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/(auth)/loading";
import { signIn, useSession } from "next-auth/react";
import { findProduct, getCartItems, removeProductFromCart } from "@/lib/actions/store.actions";
import { useAppContext } from "@/lib/AppContext";
import { syncLocalStorageWithServerCartClient } from "@/lib/utils";
import { toast } from "../ui/use-toast";

interface cartItem {
  product: string;
  quantity: number;

}

const Cart = () => {
  const [cartItems, setCartItems] = useState<cartItem[]>([])

  //If all cartitems are in stock, procceed
  const [proceed, setProceed] = useState(true);

  //State for the overall total of the cart
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false);

  //For when an cartitem gets deleted, use this
  const [update , setUpdate] = useState(false); 

   //Added for pagination of cart items
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const router = useRouter()
  const currentPath =  usePathname();
  const { data: session } = useSession();

  const goBack = ()=> {
    router.back();
  }

  const { cart } = useAppContext();

  useEffect(()=> {
    const getProducts = async ()=> {
      if(session)
      {
        //sync localstorage cart with server cart if it exists 
        await syncLocalStorageWithServerCartClient(session.user.id);
        //If User is logged in check database for the cart with products
        const serverCart = await getCartItems(session.user.id)
        setCartItems(serverCart)
      }else{
        console.log("i ran")
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
  //added update dependency incase an product gets edited I can refetch the cart

    useEffect(()=> {
      const getPrices = async ()=> {
        
        let prices:number[] = []
        let stocks:boolean[] = []
          //set default prices
        await Promise.all(cartItems.map(async (element) => {
          const data = await findProduct(element.product);
          
          if(data)
          {
            prices.push(data?.price * element.quantity)
            stocks.push(element.quantity > data?.stock ? false : true)
          }else{
            prices.push(0)
            stocks.push(false)
          }
         
        }));

        const newTotal = prices.reduce((acc, subtotal) => acc + subtotal, 0);
        const inStock =  stocks.every((item) => item === true);
        setTotal(newTotal)
        setProceed(inStock)
      }

      getPrices()
    }, [cartItems])

  const handleCheckout = ()=> {
    if(!session){
        // Set data in sessionStorage so user can navigate back to exact page after loggin in
        sessionStorage.setItem('path', currentPath);
        signIn()
    }else{
      if(proceed)
      {
        router.push("/checkout")
      }else{
        toast({
          title: "Items Unavailable",
          description: "Some cart items have exceeded stock, please remove those and try again.", 
          variant: "destructive",
        })
      }
      
    }
  }

    // Calculate the index of the last item to be displayed on the current page
  const indexOfLastItem = currentPage * itemsPerPage;

  // Calculate the index of the first item to be displayed on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the cartItems array to get the items for the current page
  const currentCartItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

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
          {currentCartItems.map((cartItem, index) => (
            <CartItem 
            key={cartItem.product}
            product={cartItem.product} 
            quantity={cartItem.quantity} 
            update={update} 
            setUpdate={setUpdate}
            />
            
          ))}

          {cartItems.length === 0 && 
            <h1 className="p-4 text-heading2-bold">Cart is empty</h1>
          }

          {/* Pagination */}
          <div className={`pagination ${cartItems.length === 0 ? "!hidden" : ""}`}>
            <Button
              onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))}
              disabled={currentPage === 1}
              className="!text-small-regular text-light-2 bg-black"
            >
              Prev
            </Button>
            <p className="text-small-semibold text-black">{currentPage}</p>
            <Button
              onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
              disabled={indexOfLastItem >= cartItems.length}
              className={`!text-small-regular text-light-2 bg-black`}
            >
              Next
            </Button>
          </div>

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
                <span>Total without Tax:</span>
                <span className="font-medium">${(total > 0 ? (total + 10.00) : (0)).toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                {session ? "Checkout" :  "Login to Checkout"}
              </Button>
              <div className={`text-red-500 ${proceed ? 'hidden' : ''}`}>one or more items out of stock</div>
            </div>
            <div className="py-0.5">
            <Link className="hover:underline" href="/products" >
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
