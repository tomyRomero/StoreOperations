"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const AdminDashboard = () => {

  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/adminusers">
          <Image 
          src={"/assets/dash.png"}
          alt={"dashboard icon"}
          width={24}
          height={24}
          />
          <span className="">Dashboard</span>
        </Link>
        <Button className="ml-auto h-8 w-8" size="icon" variant="outline">
          <Image 
          src={"/assets/bell.png"}
          alt={"bell icon"}
          width={24}
          height={24}
          />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${pathname === "/adminusers" ? "bg-gray-300" : ""} hover:bg-gray-100`}
            href="/adminusers"
          >
             <Image 
              src={"/assets/users.png"}
              alt={"users icon"}
              width={24}
              height={24}
              />
            Users
          </Link>
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${pathname === "/admincategories" ? "bg-gray-300" : ""} hover:bg-gray-100`}
            href="/admincategories"
          >
            <Image 
              src={"/assets/categories.png"}
              alt={"categories icon"}
              width={24}
              height={24}
              />
            Categories
          </Link>
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900  transition-all hover:text-gray-900 ${pathname === "/adminproducts" ? "bg-gray-300" : ""} hover:bg-gray-100`}
            href="/adminproducts"
          >
             <Image 
              src={"/assets/products.png"}
              alt={"products icon"}
              width={24}
              height={24}
              />
            Products
          </Link>
          <Link
            className={` flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${pathname === "/adminorders" ? "bg-gray-300" : ""} hover:bg-gray-100`}
            href="/adminorders"
          >
             <Image 
              src={"/assets/orders.png"}
              alt={"orders icon"}
              width={24}
              height={24}
              />
            Orders
          </Link>
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${pathname === "/adminannoucements" ? "bg-gray-300" : ""} hover:bg-gray-100`}
            href="/adminannoucements"
          >
             <Image 
              src={"/assets/speaker.png"}
              alt={"speaker icon"}
              width={24}
              height={24}
              />
            Annoucements
          </Link>
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${pathname === "/adminlayout" ? "bg-gray-300" : ""} hover:bg-gray-100 `}
            href="/adminlayout"
          >
             <Image 
              src={"/assets/layout.png"}
              alt={"layout icon"}
              width={24}
              height={24}
              />
            Layout
          </Link>
        </nav>
      </div>
    </div>
  </div>
  )
}

export default AdminDashboard

