import React from 'react'
import Link from 'next/link'
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button'



const MobileAdminDashboard = () => {
  return (
    <header className="w-full lg:hidden flex items-center gap-4 border-b bg-gray-100/40 p-6 fixed">
    <Link className="lg:hidden" href="#">
      <Package2Icon className="h-6 w-6" /> 
      <span className="sr-only">Home</span>
    </Link>
    <div className="w-full flex-1">
         Admin Dashboard
    </div>
    <div className='pr-6'>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-lg border-gray-200dark:border-gray-800"
          variant="ghost"
        >
          <h1>Admin Menu</h1>

        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>
        <Link href={'/orders'}>
        Order
        </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  </header>
  )
}

export default MobileAdminDashboard

function Package2Icon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
        <path d="M12 3v6" />
      </svg>
    )
  }
