"use client"

import React from 'react'
import Link from 'next/link'
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navItems = [
  { title: 'Recent Activity', url: '/adminactivity', img: '/assets/bell.png' },
  { title: 'Users', url: '/adminusers', img: '/assets/users.png' },
  { title: 'Categories', url: '/admincategories', img: '/assets/categories.png' },
  { title: 'Products', url: '/adminproducts', img: '/assets/products.png' },
  { title: 'Orders', url: '/adminorders', img: '/assets/orders.png' },
  { title: 'Announcements', url: '/adminannoucements', img: '/assets/speaker.png' },
  { title: 'Layout', url: '/adminlayout', img: '/assets/layout.png' },
];

const MobileAdminDashboard = () => {

  const pathname = usePathname()

  return (
    <header className="z-50 w-full bg-white lg:hidden flex items-center gap-4 border-y bg-gray-100/40 p-4 fixed flex-wrap max-xxs:justify-center">
      <Link href={"/adminactivity"}>
        <Button className="sm:px-2 xs:px-0.5" variant="ghost">
          <Image
            src="/assets/profile.png"
            alt="profile icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Welcome Admin</span>
        </Button>
      </Link>
      <div className='ml-auto max-xss:justify-center max-xxs:mx-auto'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
            <Button
              className="rounded-lg bg-white text-black hover:text-black border border-black"
              variant="ghost"
            >
              Admin Menu
              <Image 
                src={"/assets/menu.png"}
                alt="menu"
                width={24}
                height={24}
                className='ml-2'
              />
            </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Pages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navItems.map((item, index) => (
              <React.Fragment key={item.url}>
                <Link href={item.url}>
                  <DropdownMenuItem className={`flex gap-4 ${pathname === item.url ? "bg-gray-300" : ""}`}>
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

export default MobileAdminDashboard
