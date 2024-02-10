import React from 'react'
import Link from 'next/link'
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button'
import Image from 'next/image'



const MobileAdminDashboard = () => {
  return (
    <header className="z-50 w-full bg-white lg:hidden flex items-center gap-4 border-y bg-gray-100/40 p-4 fixed flex-wrap">
      <Link href={"/adminusers"}>
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
    <div className='ml-auto'>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Pages</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={'/adminactivity'} >
          <DropdownMenuItem className='flex gap-4'>
            <Image 
                src={"/assets/bell.png"}
                alt={"bell icon"}
                width={24}
                height={24}
                />
              Recent Activity
          </DropdownMenuItem>
        </Link>
        <Link href={'/adminusers'} >
          <DropdownMenuItem className='flex gap-4'>
            <Image 
                src={"/assets/users.png"}
                alt={"users icon"}
                width={24}
                height={24}
                />
              Users
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href={'/admincategories'} >
          <DropdownMenuItem className='flex gap-4'>
              <Image 
                  src={"/assets/categories.png"}
                  alt={"categories icon"}
                  width={24}
                  height={24}
                  />
                Categories
          </DropdownMenuItem>
        </Link>
        <Link href={'/adminproducts'}>
          <DropdownMenuItem className='flex gap-4'>
                  <Image 
                      src={"/assets/products.png"}
                      alt={"products icon"}
                      width={24}
                      height={24}
                      />
                    Products 
          </DropdownMenuItem>
        </Link>
        <Link href={'/adminorders'} >
          <DropdownMenuItem className='flex gap-4'>
                <Image 
                    src={"/assets/orders.png"}
                    alt={"orders icon"}
                    width={24}
                    height={24}
                    />
                  Orders
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
          <Link href={'/adminannoucements'} >
              <DropdownMenuItem className='flex gap-4'>
                <Image 
                    src={"/assets/speaker.png"}
                    alt={"speaker icon"}
                    width={24}
                    height={24}
                    />
                  Annoucements
          </DropdownMenuItem>
          </Link>
      <Link href={'/adminlayout'}>
        <DropdownMenuItem className='flex gap-4'>
              <Image 
                  src={"/assets/layout.png"}
                  alt={"layout icon"}
                  width={24}
                  height={24}
                  />
                Layout        
        </DropdownMenuItem>
        </Link>  
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  </header>
  )
}

export default MobileAdminDashboard
