import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";

export default function Nav() {
  return (
    <header className="fixed flex z-10 bg-white h-20 w-full items-center p-8 max-xs:px-0 md:py-14 md:px-24 lg:py-14 lg:px-36">
      <Link className="mr-6 flex" href="#">
        <h1 className="px-1 text-heading2-bold max-md:text-heading3-bold justify-center">PaletteHub.</h1>
      </Link>
      <div className="ml-auto flex items-center gap-2 max-xs:gap-1 wrap">
        <Button className="flex px-2 max-xs:px-0.5" variant="ghost">
          <Image
            src="/assets/price.png"
            alt="price icon"
            width={32}
            height={32}
            className="px-1 max-md:hidden"
          />
          <span className="ml-2">Shop</span>
        </Button>
        <Button className="flex px-2" variant="ghost">
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
        <Button className="flex px-6 py-3 bg-black rounded-lg">
            <span className='text-white'>LOGIN</span>
        </Button>
      </div>
    </header>
  );
}

