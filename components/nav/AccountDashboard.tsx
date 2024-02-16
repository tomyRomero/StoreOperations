"use client"

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

  // Navigation items
  const navItems = [
    { title: 'Account', url: '/account' , img: "/assets/profilehome.png"},
    { title: 'Orders', url: '/account/orders', img: "/assets/orders.png"},
    { title: "Addresses" , url: "/account/myaddresses", img: "/assets/address.png"},
  ];

const AccountDashboard = ({username, email} : {username: string, email:string}) => {

    const pathname = usePathname();

    return(
    <div className="hidden w-full border-r lg:block">

    <div className="w-[17rem] fixed flex h-full min-h-screen flex-col gap-5 p-3">
        <Link href="/account">
            <div className="flex items-center mb-4 p-2">
                <div className="ml-4">
                  <p className="font-bold">{username}</p>
                  <p className="font-bold text-black">{email}</p>
            </div>
        </div>
        </Link>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-4 items-start px-4">
          {navItems.map((item) => (
            <Link
              key={item.url}
              className={`flex items-center p-2 px-3 rounded-xl hover:bg-gray-200 ${pathname === item.url ? "bg-gray-200" : ""} `}
              href={item.url}
            >
                <div className='flex gap-4'>
              <Image 
                src={item.img}
                alt={`${item.title} icon`}
                width={24}
                height={24}
                
              />
              <p className='text-body-semibold font-bold'>{item.title}</p>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  </div>
)
}


export default AccountDashboard