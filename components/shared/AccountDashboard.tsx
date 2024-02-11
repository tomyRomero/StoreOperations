"use client"

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


  // Hardcoded user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  // Navigation items
  const navItems = [
    { title: 'Account', url: '/account' , img: "/assets/profilehome.png"},
    { title: 'Orders', url: '/account/orders', img: "/assets/orders.png"},
    { title: "Addresses" , url: "/account/myaddresses", img: "/assets/address.png"},
  ];

const AccountDashboard = () => {

    const pathname = usePathname();

    return(
    <div className="hidden w-full border-r bg-gray-100/40 lg:block">

    <div className="w-[17rem] fixed flex h-full max-h-screen flex-col gap-5 p-3">
            <div className="flex items-center mb-4 p-2">
                <div className="rounded-full overflow-hidden">
                  <Image src="/assets/profile.png" alt="profile" width={50} height={50} />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
            </div>
        </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-4 items-start px-4 text-sm font-medium">
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
              <p className='text-body-semibold'>{item.title}</p>
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