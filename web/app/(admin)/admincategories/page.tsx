import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table";
import CategoryRow from '@/components/tables/CategoryRow';
import SearchBar from '@/components/forms/SearchBar';
import { getAdminCategories } from '@/lib/data/admin-catalog';

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  // A store has a handful of categories, so they all come at once and the search filters them here
  const search = (searchParams.q ?? "").trim().toLowerCase();
  const categories = await getAdminCategories();
  const shown = categories?.filter((c) => c.name.toLowerCase().includes(search)) ?? [];

  return (
    <section className="grid grid-cols-1 gap-4 md:pt-24 max-sm:pt-20 lg:pt-0">
      <div className="flex items-center">
        <h1 className="text-heading4-bold">Categories</h1>
        <Button asChild className="ml-auto" size="sm">
          <Link href="/adminaddcategory">Add Category</Link>
        </Button>
      </div>
      <SearchBar routeType="admincategories" placeholder="Search categories by name" />
      <div className="border shadow-sm rounded-lg">
        {categories === null ? (
          <p className="p-10 text-red-600">Failed to load categories. Please try again later.</p>
        ) : shown.length === 0 ? (
          <p className="p-10">{search ? "No categories match." : "No categories yet. Click Add Category to get started."}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black w-[100px]"><span className="sr-only">Image</span></TableHead>
                <TableHead className="font-bold text-black">Actions</TableHead>
                <TableHead className="font-bold text-black">Name</TableHead>
                <TableHead className="font-bold text-black text-center">Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
