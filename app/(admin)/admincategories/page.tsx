import React from 'react'
import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import Link from "next/link"
import { getAllCategories } from '@/lib/actions/store.actions';
import CategoryRow from '@/components/tables/CategoryRow';

export default async function page() {

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
        <TableHead className="font-bold text-black w-[200px]">Image</TableHead>
        <TableHead className="font-bold text-black">ID</TableHead>
        <TableHead className="font-bold text-black">Title</TableHead>
        <TableHead className='font-bold text-black'>Registration Date</TableHead>
        <TableHead className="font-bold text-black">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {categories?.map((category)=> (
        <CategoryRow
        key={category.id}
        id={category.id} 
        photo={category.photo}
        date={category.date}
        title={category.title}
      />
    ))}
    </TableBody>
  </Table>
  {categories?.length === 0 || !categories  && <h1 className="p-10">
  No categories Have been added, click on add category to get started
   </h1>}
    </div>
</section>
  )
}

