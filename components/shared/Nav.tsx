"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";
import {useRouter } from "next/navigation";
import { signIn, signOut, useSession } from 'next-auth/react';


export default function Nav() {

  const router = useRouter();

  function AuthButton() {
    const { data: session } = useSession();
   
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
            callbackUrl: `/`
          })}>
            LOGOUT
            </Button>
        </>
      );
    }
    return (
      <>
        <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg  hover:text-black hover:bg-gray-200" onClick={() => signIn()}>LOGIN</Button>
      </>
    );
  }

  return (

    <header className="bg-white fixed flex z-50 w-full flex-wrap items-center xs:py-6 xs:px-4 sm:py-6 sm:px-14 px-4 py-4 md:py-8 md:px-18 lg:py-10 lg:px-32 xl:px-36">
      <Link className="sm:mr-6 xs:mr-2 first-letter:flex" href="/">
        <h1 className="xs:px-0 px-1 text-heading2-bold max-md:text-heading3-bold justify-center">PaletteHub.</h1>
      </Link>
      <div className="max-sm:mr-auto ml-auto flex items-center gap-2 flex-wrap">
        <Button className="flex sm:px-2 xs:px-0.5" variant="ghost">
          <Image
            src="/assets/price.png"
            alt="price icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">Shop</span>
        </Button>
        <Button className="flex sm:px-2 xs:px-0.5" variant="ghost">
        <Image
            src="/assets/cart.png"
            alt="cart icon"
            width={28}
            height={28}
            className="px-1 w-8 h-6 max-md:hidden"
          />
          <span className="ml-2">Cart</span>  
          <Badge className="ml-2 h-3 w-4 flex items-center justify-center rounded-full p-3">1</Badge>
        </Button>
        <AuthButton />
      </div>
    </header>
    
  );
}

