import SearchBar from '@/components/forms/SearchBar'
import Pagination from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button';
import { getAllProductsWithSearch } from '@/lib/actions/store.actions';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import ProductCard from '@/components/cards/ProductCard';

const page = async ({
    searchParams,
  }: {
    searchParams: { [key: string]: string | undefined };
  }) => {

    try{
    const searchString = searchParams.q; //search string
    const pageNumber = searchParams.page ? + searchParams.page : 1; //page number
    const pageSize = 6; 
    const sortBy = "desc"; 
    
    

    let {results, isNext, totalPages} = await getAllProductsWithSearch(
        {  
            pageNumber,
            pageSize,
            searchQuery: searchString,
            sortOrder: sortBy
          }
    );

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
        {results.map((product: any)=> (
        <ProductCard key={product.stripeProductId} 
        stripeProductId={product.stripeProductId} 
        name={product.name}
        description={product.description} 
        stock={product.stock} 
        price={product.price}
        category={product.category} 
        photo={product.photo}/>
        ))}

        {results.length === 0 && (
        <h1>No Products</h1>
        )}
        </div>
    </div>
         <Pagination
          path={createPaginationPath()}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={isNext}
        />
        <br></br>
    </section>
  )
    } catch(error)
    {
      return(
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
        <h1>Error Occured , Try Refreshing</h1>
        </div>
          </section>
      )
    }
}

export default page