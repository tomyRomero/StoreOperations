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
            alt="profile icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Welcome Admin</span>
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
    <header className="border-b-2 border-black bg-white fixed flex z-50 w-full flex-wrap items-center xs:py-6 xs:px-4 sm:py-6 sm:px-14 px-4 py-4 md:py-8 md:px-18 lg:py-10 lg:px-32 xl:px-36">
      <Link className="sm:mr-6 xs:mr-2 first-letter:flex" href="/">
        <h1 className="xs:px-0 px-1 text-heading2-bold max-md:text-heading3-bold justify-center">PaletteHub.</h1>
      </Link>
    
    <div className='ml-auto flex gap-2'>
    <AuthButton />
    </div>
    </header>
  );
}

