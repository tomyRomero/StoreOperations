"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import Image from 'next/image'
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { usePathname } from 'next/navigation'


  // Navigation items
  const navItems = [
    { title: 'Account', url: '/account' , img: "/assets/profilehome.png"},
    { title: 'Orders', url: '/account/orders', img: "/assets/orders.png"},
    { title: "Addresses" , url: "/account/myaddresses", img: "/assets/address.png"},
  ];

const MobileAccountDashboard = ({username} : {username: string}) => {

    const pathname = usePathname();

    return (
        <header className="mt-1 z-10 w-full bg-white lg:hidden flex items-center gap-4 border-y bg-gray-100/40 px-3  pt-4 fixed">
          <Link href={"/account"}>
            <div className="flex items-center mb-4 px-2">
                <div className="rounded-full overflow-hidden">
                  <Image src="/assets/profile.png" alt="profile" width={50} height={50} />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{username}</p>
            </div>
           </div>
          </Link>
          <div className='ml-auto mb-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-lg bg-white text-black hover:text-black border border-black"
                  variant="ghost"
                >
                 Menu
                  <Image 
                    src={"/assets/menu.png"}
                    alt="menu"
                    width={24}
                    height={24}
                    className='ml-2'
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item, index) => (
                  <React.Fragment key={item.url}>
                    <Link href={item.url}>
                      <DropdownMenuItem className={`flex gap-4 cursor-pointer hover:bg-gray-100 ${pathname === item.url ? "bg-gray-200" : ""}`}>
                        <Image 
                          src={item.img}
                          alt={`${item.title} icon`}
                          width={24}
                          height={24}
                        />
                        {item.title}
                      </DropdownMenuItem>
                    </Link>
                    {index !== navItems.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )
}

export default MobileAccountDashboard