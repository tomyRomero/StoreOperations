import SearchBar from '@/components/forms/SearchBar'
import Pagination from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/data/catalog';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import ProductCard from '@/components/cards/ProductCard';

const page = async (props: { searchParams: Promise<{ [key: string]: string | undefined }> }) => {
    const searchParams = await props.searchParams;

    // Matches product and category names, newest first
    const pageNumber = Math.max(1, Number(searchParams.page) || 1);
    const found = await getProducts({
      search: searchParams.q?.slice(0, 100),
      sort: "newest",
      page: pageNumber,
      pageSize: 6,
    });
    const results = found?.items ?? [];
    const isNext = found !== null && pageNumber < found.totalPages;

    const createPaginationPath = ()=> {
        // Create a new URLSearchParams object
       const params = new URLSearchParams();  
    
       //Add the search parameter to the URLSearchParams
       params.append('q', searchParams.q ? searchParams.q || searchParams.q : "");
    
       // Get the final query string
       const queryString = params.toString();
    
       //include the queryString in pagination
       return `/search?${queryString}&`
  }

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-20 sm:pt-24">
    <h1 className='text-heading3-bold pb-4'>Search</h1>
    <Link href="/products">
    <Button className="flex px-2 border border-black" variant="ghost">
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">All Products</span>
        </Button>
        </Link>
        <br></br>
     <SearchBar routeType='search' placeholder='Search For Products By Name or Category' />
        <br></br>
       
    <div className="grid gap-10 items-start">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {results.map((product)=> (
        <ProductCard key={product.id} product={product} />
        ))}

        {found === null && (
        <h1>Error Occured , Try Refreshing</h1>
        )}

        {found !== null && results.length === 0 && (
        <h1>No Products</h1>
        )}
        </div>
    </div>
         <Pagination
          path={createPaginationPath()}
          pageNumber={pageNumber}
          isNext={isNext}
        />
        <br></br>
    </section>
  )
}

export default page