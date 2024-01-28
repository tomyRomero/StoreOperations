import React from 'react'
import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { getServerSession } from "next-auth";
import Link from "next/link"
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CategoryTable from '@/components/tables/CategoryRow';
import { getAllCategories } from '@/lib/actions/user.actions';
import CategoryRow from '@/components/tables/CategoryRow';

export default async function page() {

  const session = await getServerSession(authOptions);

  if(session === undefined || session?.user.admin === false)
  {
    redirect("/")
  }
  
 

  const categories = await getAllCategories();

  return (
    <section className="grid grid-cols-1 md:pt-24 max-sm:pt-20 lg:pt-0">
    <div className="flex items-center">
      <h1 className="font-semibold">Categories</h1>
        <Link href="/adminaddcategory" className="ml-auto">
          <Button className="ml-auto" size="sm">
            Add Category
          </Button>
        </Link>
    </div>
    <div className="mt-4 border shadow-sm rounded-lg">
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Image</TableHead>
        <TableHead className="">ID</TableHead>
        <TableHead className="">Title</TableHead>
        <TableHead>Registration Date</TableHead>
        <TableHead className="">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {categories.map((category)=> (
        <CategoryRow
        key={category.id}
        id={category.id} 
        image={category.photo}
        date={category.date}
        title={category.title}
      />
    ))}
    </TableBody>
  </Table>
    </div>
</section>
  )
}

