import React from 'react'
import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import Link from "next/link"
import { getAllCategories } from '@/lib/actions/store.actions';
import CategoryRow from '@/components/tables/CategoryRow';
import { getAllCategoriesAdmin } from '@/lib/actions/admin.actions';
import Pagination from '@/components/shared/Pagination';
import SearchBar from '@/components/forms/SearchBar';

export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  const searchString = searchParams.q; //search string
  const pageNumber = searchParams.page ? + searchParams.page : 1; //page number
  const pageSize = 5; 
  const sortBy = "desc"; 

  const { categories, isNext } = await getAllCategoriesAdmin({
    searchString,
    pageNumber,
    pageSize,
    sortBy,
  });

  const createPaginationPath = ()=> {
    // Create a new URLSearchParams object
   const params = new URLSearchParams();  

   //Add the search parameter to the URLSearchParams
   params.append('q', searchParams.q ? searchParams.q || searchParams.q : "");

   // Get the final query string
   const queryString = params.toString();

   //include the queryString in pagination
   return `/admincategories?${queryString}&`
  }

  return (
    <section className="grid grid-cols-1 md:pt-24 max-sm:pt-20 lg:pt-0">
    <div className="flex items-center">
      <h1 className="text-heading4-bold">Categories</h1>
        <Link href="/adminaddcategory" className="ml-auto">
          <Button className="ml-auto" size="sm">
            Add Category
          </Button>
        </Link>
    </div>
    <br>
    </br>
    <SearchBar routeType="admincategories" placeholder={"Search for Categories by Title or ID"}/>
    <div className="mt-4 border shadow-sm rounded-lg">
    <br></br>
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="font-bold text-black w-[200px]">Image</TableHead>
        <TableHead className="font-bold text-black">Action</TableHead>
        <TableHead className="font-bold text-black">Title</TableHead>
        <TableHead className="font-bold text-black">ID</TableHead>
        <TableHead className='font-bold text-black'>Registration Date</TableHead>
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
    <Pagination
          path={createPaginationPath()}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={isNext}
        />
</section>
  )
}

