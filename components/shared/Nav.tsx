"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";
import {useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from 'next-auth/react';
import { useAppContext } from '@/lib/AppContext';
import { getCartItems, syncLocalStorageWithServerCart } from '@/lib/actions/store.actions';


const Nav = () => {

  const [cartNum, setCartNum] = useState(0)

  const {productAdjusted, cart} = useAppContext();
  const router = useRouter();
  const { data: session } = useSession();
  const currentPath =  usePathname();

 
  useEffect(()=> {
    const getCartItemsNum = async ()=> {

      if(session)
      {
        //If User is logged in check database for the cart
        const serverCart = await getCartItems(session.user.id)
        setCartNum(serverCart.length)
      }else{
         // If user is not logged, check localStorage
         const localStorageCartString = localStorage.getItem('cart');
         if (localStorageCartString) {
           // If localStorage has cart data, parse it and check if the product is in the cart
           const localStorageCart = JSON.parse(localStorageCartString);
           setCartNum(localStorageCart.length)
         }else{
          // If localStorage is empty check the cart global state as a final check
          setCartNum(cart.length)
         }
      }
    }

    getCartItemsNum();

   
  }, [productAdjusted])

  function AuthButton() {
    if (session) {
      return (
        <>
          <Button className="flex sm:px-2 xs:px-0.5" variant="ghost">
          <Image
            src="/assets/profile.png"
            alt="price icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">{session.user.admin? "Admin" : "Account"}</span>
        </Button>
          <Button variant="destructive" className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg" onClick={() => signOut({
            redirect: true,
            callbackUrl: `${currentPath}`
          })}>
            LOGOUT
            </Button>
        </>
      );
    }
    return (
      <>
        <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg  hover:text-black hover:bg-gray-200" 
          onClick={()=> {
          // Set data in sessionStorage so user can navigate back to exact page after loggin in
          sessionStorage.setItem('path', currentPath);
          signIn()
          }}>
            LOGIN
          </Button>
      </>
    );
  }

  return (

    <header className="bg-white fixed flex z-50 w-full flex-wrap items-center border-b border-black xs:py-6 xs:px-4 sm:py-6 sm:px-14 px-4 py-4 md:py-8 md:px-18 lg:py-10 lg:px-32 xl:px-36">
      <Link className="sm:mr-6 xs:mr-2 first-letter:flex" href="/">
        <h1 className="xs:px-0 px-1 text-heading2-bold max-md:text-heading3-bold justify-center">PaletteHub.</h1>
      </Link>
      <div className="max-sm:mr-auto ml-auto flex items-center gap-2 flex-wrap">
        <Button className="flex sm:px-2 xs:px-0.5" variant="ghost" onClick={()=>{router.push("/products")}}>
          <Image
            src="/assets/price.png"
            alt="price icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">Shop</span>
        </Button>
        <Button className="flex sm:px-2 xs:px-0.5" variant="ghost" onClick={()=>{router.push("/cart")}}>
        <Image
            src="/assets/cart.png"
            alt="cart icon"
            width={28}
            height={28}
            className="px-1 w-8 h-6 max-md:hidden"
          />
          <span className="ml-2">Cart</span>  
          <Badge className={`ml-2 h-3 w-4 hidden items-center justify-center rounded-full p-3 ${cartNum > 0 ? "flex" : ""}`}>{cartNum}</Badge>
        </Button>
        <AuthButton />
      </div>
    </header>
    
  );
}

export default Nav;

