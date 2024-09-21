import React from 'react';
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import Link from "next/link";
import { getAllCategoriesAdmin } from '@/lib/actions/admin.actions';
import CategoryRow from '@/components/tables/CategoryRow';
import Pagination from '@/components/shared/Pagination';
import SearchBar from '@/components/forms/SearchBar';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const searchString = searchParams.q || ''; // Handle empty search string
    const pageNumber = searchParams.page ? +searchParams.page : 1; // Fallback to page 1 if not provided
    const pageSize = 5;
    const sortBy = "desc"; 

    const { categories, isNext } = await getAllCategoriesAdmin({
      searchString,
      pageNumber,
      pageSize,
      sortBy,
    });

    const createPaginationPath = () => {
      // Create a new URLSearchParams object
      const params = new URLSearchParams();

      // Add search string if it exists
      if (searchString) {
        params.append('q', searchString);
      }

      // Include the query string in pagination
      const queryString = params.toString();
      return `/admincategories?${queryString}&`;
    };

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
        <br />
        <SearchBar routeType="admincategories" placeholder="Search for Categories by Title or ID" />
        <div className="mt-4 border shadow-sm rounded-lg">
          <br />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black w-[200px]">Image</TableHead>
                <TableHead className="font-bold text-black">Action</TableHead>
                <TableHead className="font-bold text-black">Title</TableHead>
                <TableHead className="font-bold text-black">ID</TableHead>
                <TableHead className="font-bold text-black">Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.length ? (
                categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    id={category.id}
                    photo={category.photo}
                    date={category.date}
                    title={category.title}
                  />
                ))
              ) : (
                <h1 className="p-10">
                  No categories have been added, click on add category to get started.
                </h1>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          path={createPaginationPath()}
          pageNumber={pageNumber}
          isNext={isNext}
        />
      </section>
    );
  } catch (error) {
    return (
      <section className="grid grid-cols-1 md:pt-24 max-sm:pt-20 lg:pt-0">
        <div className="flex items-center">
          <h1 className="text-heading4-bold">Categories</h1>
        </div>
        <div className="mt-4 border shadow-sm rounded-lg">
          <h1 className="p-10 text-red-600">
            Failed to load categories. Please try again later.
          </h1>
        </div>
      </section>
    );
  }
}