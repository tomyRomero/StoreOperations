"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";
import {useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from '../CurrentUserProvider';
import { useCart } from '../cart/CartProvider';
import { useSignOut } from '@/lib/use-sign-out';
import { signInPath } from '@/lib/sign-in-path';
import MenuToggle from './MenuToggle';
import { AnimatePresence } from 'framer-motion';
import { motion as m } from 'framer-motion';
import NavMenu from './NavMenu';
import { storeDetails } from '@/lib/constants';


// Signed in: the account (or admin) page and a way out. Otherwise a way in that comes back here.
function AuthButton() {
  const router = useRouter();
  const user = useCurrentUser();
  const signOut = useSignOut();
  const currentPath = usePathname();

  if (user) {
    return (
      <>
        <Button className="flex sm:px-2 xs:px-0.5" variant="ghost" onClick={() => router.push("/account")}>
        <Image
          src="/assets/profile.png"
          alt="price icon"
          width={32}
          height={32}
          className="px-1 max-md:hidden"
        />
        <span className="ml-2">{user.isAdmin? "Admin" : "Account"}</span>
      </Button>
        <Button variant="destructive" className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg" onClick={() => signOut(currentPath)}>
          LOGOUT
          </Button>
      </>
    );
  }
  return (
    <>
      <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg  hover:text-black hover:bg-gray-200"
        onClick={()=> router.push(signInPath(currentPath))}>
          LOGIN
        </Button>
    </>
  );
}

const Nav = () => {

  const [isActive, setIsActive] = useState(false);
  const { itemCount: cartNum } = useCart();

  const router = useRouter();
  const user = useCurrentUser();

  return (
    <div className='relative'>
    <header className="bg-white fixed flex z-50 w-full top-0 items-center border-b border-black xs:py-6 xs:px-4 sm:py-6 sm:px-14 px-4 py-4 md:py-8 md:px-18 lg:py-10 lg:px-32 xl:px-36">
      <Link className="sm:mr-6 xs:mr-2 first-letter:flex" href="/">
        <h1 className="xs:px-0 px-1 text-heading2-bold max-md:text-heading3-bold max-xxs:text-heading4-bold justify-center">{storeDetails.title}</h1>
      </Link>
      <div className="max-md:hidden ml-auto flex items-center gap-2">
      <Button className="flex" variant="ghost" onClick={()=>{router.push("/search")}}>
          <Image
            src="/assets/searchblack.png"
            alt="search icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">Search</span>
        </Button>
        <Button className="flex" variant="ghost" onClick={()=>{router.push("/products")}}>
          <Image
            src="/assets/price.png"
            alt="price icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">Shop</span>
        </Button>
        <Button className="flex" variant="ghost" onClick={()=>{router.push("/cart")}}>
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
      <div className='max-md:flex gap-5 max-xxs:gap-2 md:hidden ml-auto'>
      <Button className="flex sm:px-2 xxs:px-0" variant="ghost" onClick={()=>{router.push("/cart")}}>
        <Image
              src="/assets/cart.png"
              alt="cart icon"
              width={24}
              height={24}
              className='pl-1'
            />
          <span className="ml-2 font-bold max-xxs:text-small-regular!">Cart</span>  
          <Badge className={`ml-2 h-3 w-4 hidden items-center justify-center rounded-full p-3 max-xxs:p-2 ${cartNum > 0 ? "flex max-xxs:text-small-regular!" : ""}`}>{cartNum}</Badge>
        </Button>
        <MenuToggle isActive={isActive} setIsActive={setIsActive} />
        <NavMenu
            isActive={isActive}
            setIsActive={setIsActive}
          />
      </div>
    </header>

<AnimatePresence>
{isActive && (
  <m.div
    initial={{ scaleY: 0, originY: 0 }}
    animate={{ scaleY: user? 0.7 : 0.6 }}
    exit={{ scaleY: 0 }}
    transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    onClick={() => setIsActive(false)}
    className="bg-white fixed top-0 left-0 right-0 bottom-0 z-20! border-b-2 border-black "
  ></m.div>
)}
</AnimatePresence>
</div>
  );
}

export default Nav;

