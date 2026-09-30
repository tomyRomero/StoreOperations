
import Filters from '@/components/shared/Filter'
import React from 'react'
import { getCategories, getProducts } from '@/lib/data/catalog'
import type { ProductSort } from '@/lib/api/types'
import ProductCard from '@/components/cards/ProductCard'
import Pagination from '@/components/shared/Pagination'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// The API's sort names, plus the old "lowest"/"highest" links
const sorts: Record<string, ProductSort> = {
  cheapest: "cheapest", lowest: "cheapest",
  priciest: "priciest", highest: "priciest",
  newest: "newest", oldest: "oldest",
};

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const categories = await getCategories()

  // ?categories=1,2 checks those categories' boxes
  const categoriesArray = (searchParams.categories ?? "").split(',').filter((id) => /^\d+$/.test(id))
  const sort = sorts[searchParams.sorted ?? ""] ?? "cheapest"
  const pageNumber = Math.max(1, Number(searchParams.page) || 1)

  const serverProducts = await getProducts({
    categoryIds: categoriesArray.map(Number),
    sort,
    page: pageNumber,
    pageSize: 8,
  })

  if (!serverProducts) {
    return (
      <section className="mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20">
        <h1 className="text-red-500">Failed to load products. Please try again later.</h1>
      </section>
    );
  }

  const createPaginationPath = ()=> {
   const params = new URLSearchParams();
   params.append('categories', categoriesArray.join(','));
   params.append('sorted', sort);
   return `/products?${params.toString()}&`
  }
  
  return (
    
    <section className="mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20 max-xs:pt-28">
       <div className="grid xl:grid-cols-4 gap-10 items-start">
          <Filters categoriesList={categories} categoryParams={categoriesArray} sortParams={sort}/>
          <div className="xl:col-span-3 lg:mt-6 xl:mt-14 grid gap-6 md:gap-8 max-sm:p-0">
            <div>
          <Link href="/search">
                <Button className="flex px-2 border border-black" variant="ghost">
                  <Image
                    src="/assets/searchblack.png"
                    alt="search icon"
                    width={28}
                    height={28}
                  />
                  <span className="ml-2">Search Products</span>
                </Button>
              </Link>
              </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {serverProducts.items.map((product)=> (
                    <ProductCard key={product.id} product={product} />
                    ))}

                    {serverProducts.items.length === 0 && (
                      <h1>No Products</h1>
                    )}
                </div>
                <div className='mx-auto'>
                    <h4 className={`text-body-bold ${serverProducts.totalPages <= 1 ? 'hidden' : ''}`}>Showing {pageNumber} of {serverProducts.totalPages} Pages</h4>
                    <Pagination
                      path={createPaginationPath()}
                      pageNumber={pageNumber}
                      isNext={pageNumber < serverProducts.totalPages}
                    />
              </div>
      </div>
      </div>
  </section>
  )
}


export default page
