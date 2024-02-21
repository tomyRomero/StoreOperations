"use client"

import { Address } from "@/app/types/global"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import {  TableRow,  TableCell } from "@/components/ui/table"
import { getUserForClient } from "@/lib/actions/admin.actions"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Props {
    orderId: string;
    total: string;
    address: Address;
    status: string;
    user: string;
    date: string;
}

export const OrderRow = ({orderId, total, address, status, user, date}: Props) => {
  const [customer, setCustomer] = useState("User")

  useEffect(()=> {
    const getCustomer = async ()=> {
        const data = await getUserForClient(user)

        if(data)
        setCustomer(data.username)

    }

    getCustomer()

  }, [])   

  return (
    <TableRow>
    <TableCell>
        <Link href={`/adminorders/${orderId}`}>
          <Button  className="bg-black text-white border border-black" variant="ghost">
            View
          </Button>
          </Link>
    </TableCell>
    <TableCell>#{orderId}</TableCell>
    <TableCell>{status === "Pending" ? (<p className="font-extrabold">Waiting to be Shipped!</p>) : <p className="font-bold">{status}</p>}</TableCell>
    <TableCell><p className="text-green-400">${total}</p></TableCell>
    <TableCell>{`${address.name} - ${address.address.line1}, ${address.address.city}, ${address.address.country}`}</TableCell>
    <TableCell>{customer}</TableCell>
    <TableCell>{date}</TableCell>
  </TableRow>
  )
}
