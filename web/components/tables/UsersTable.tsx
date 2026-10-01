import React from 'react';
import Link from 'next/link';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import type { AdminCustomerSummary } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

const UsersTable = ({ users, timeZone }: { users: AdminCustomerSummary[]; timeZone: string }) => {

  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className='font-bold text-black'><span className="sr-only">Details</span></TableHead>
        <TableHead className='font-bold text-black'>Username</TableHead>
        <TableHead className='font-bold text-black'>Email</TableHead>
        <TableHead className='font-bold text-black'>Role</TableHead>
        <TableHead className='font-bold text-black text-center'>Orders</TableHead>
        <TableHead className='font-bold text-black'>Joined</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <Button asChild className='bg-black text-white border border-black' variant={"ghost"}>
            <Link href={`/adminusers/${user.id}`}>View<span className="sr-only"> {user.username}</span></Link>
          </Button>
        </TableCell>
        <TableCell className="font-medium">{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {user.isAdmin ? "Admin" : "Customer"}
            {user.isDisabled && <Badge variant="sale">Disabled</Badge>}
          </div>
        </TableCell>
        <TableCell className="text-center">{user.orderCount}</TableCell>
        <TableCell>{formatDate(user.joinedAtUtc, timeZone)}</TableCell>
      </TableRow>
    ))}
    </TableBody>
  </Table>
  )
}

export default UsersTable
