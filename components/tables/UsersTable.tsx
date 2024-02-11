import React from 'react'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

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
        <TableHead className='font-bold text-black'>Username</TableHead>
        <TableHead className='font-bold text-black'>Email</TableHead>
        <TableHead className='font-bold text-black'>Role</TableHead>
        <TableHead className='font-bold text-black'>Registration Date</TableHead>
        <TableHead className='font-bold text-black'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {users?.map((user: User, index: any) => (
           <TableRow key={index}>
           <TableCell>{user.id}</TableCell>
           <TableCell className="font-medium">{user.username}</TableCell>
           <TableCell>{user.email}</TableCell>
           <TableCell>{user.admin? "Admin" : "User"}</TableCell>
           <TableCell>{user.date}</TableCell>
           <TableCell>
            <div className='flex'>
             <Button size="sm" variant="outline">
               Edit
             </Button>
             <Button className="ml-2" size="sm" variant="outline">
               Delete
             </Button>
             </div>
           </TableCell>
         </TableRow>
        ))}
    </TableBody>
  </Table>
  )
}

export default UsersTable