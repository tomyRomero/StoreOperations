import React from 'react';;
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface User {
  id: string,
  username: string,
  email: string,
  admin: boolean,
  date: string
}


const UsersTable = ({users} : any) => {

  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="font-bold text-black w-[100px]">ID</TableHead>
        <TableHead className='font-bold text-black'>Details</TableHead>
        <TableHead className='font-bold text-black'>Username</TableHead>
        <TableHead className='font-bold text-black text-center'>Email</TableHead>
        <TableHead className='font-bold text-black'>Role</TableHead>
        <TableHead className='font-bold text-black'>Registration Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {users?.map((user: User, index: any) => (
           <TableRow key={index}>
           <TableCell className='text-black'>{user.id}</TableCell>
           <TableCell>
            <Link href={`/adminusers/${user.id}`}>
            <Button className='bg-black text-white border border-black' variant={"ghost"}>
              View
            </Button>
            </Link>
            </TableCell>
           <TableCell className="font-medium">{user.username}</TableCell>
           <TableCell>{user.email}</TableCell>
           <TableCell>{user.admin? "Admin" : "User"}</TableCell>
           <TableCell>{user.date}</TableCell>
          
         </TableRow>
        ))}
    </TableBody>
  </Table>
  )
}

export default UsersTable