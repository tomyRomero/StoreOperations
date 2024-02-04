
import Filters from '@/components/shared/Filter'
import React from 'react'
import { getAllCategories, getAllProducts } from '@/lib/actions/store.actions'
import ProductCard from '@/components/cards/ProductCard'
import Pagination from '@/components/shared/Pagination'

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  //Seperate Logic for Getting Categories for building Filtering Checkboxes
  const categoriesData = await getAllCategories()
  const categories:any = []
  categoriesData?.forEach(element => {
    categories.push({
      id: element.id,
      title: element.title
    })
  });

  //Logic to manage data recieved when category checkboxes are checked
  const categoriesArray = searchParams.categories? searchParams.categories.split(',') : []

  const serverProducts= await getAllProducts(
    searchParams.page ? + searchParams.page : 1,
     8, 
    categoriesArray,
    searchParams.sorted ? searchParams.sorted : "lowest",
  )

  const createPaginationPath = ()=> {
    // Create a new URLSearchParams object
   const params = new URLSearchParams();  

   // Add categories to the query parameters as a single parameter with comma-separated values
   params.append('categories', categoriesArray.join(','));

   // Add the "sorted" parameter to the URLSearchParams
   params.append('sorted',  searchParams.sorted ? searchParams.sorted : "lowest");

   // Get the final query string
   const queryString = params.toString();

   // Now you can include the queryString in your API request
   return `/products?${queryString}&`
  }
  
  return (
    
    <section className="mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20 max-xs:pt-28">
       <div className="grid xl:grid-cols-4 gap-10 items-start">
          <Filters categoriesList={categories} categoryParams={categoriesArray} sortParams={searchParams.sorted ? searchParams.sorted : ""}/>
          <div className="xl:col-span-3 lg:mt-6 xl:mt-14 grid gap-6 md:gap-8 max-sm:p-0">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {serverProducts.results.map((product: any)=> (
                    <ProductCard key={product.stripeProductId} 
                    stripeProductId={product.stripeProductId} 
                    name={product.name}
                    description={product.description} 
                    stock={product.stock} 
                    price={product.price}
                    category={product.category} 
                    photo={product.photo}/>
                    ))}

                    {serverProducts.results.length === 0 && (
                      <h1>No Products</h1>
                    )}
                </div>
                <div className='mx-auto'>
                    <h4 className={`text-body-bold ${serverProducts.totalPages <= 1 ? 'hidden' : ''}`}>Showing {searchParams?.page ? + searchParams.page : 1} of {serverProducts.totalPages} Pages</h4>
                    <Pagination
                      path={createPaginationPath()}
                      pageNumber={searchParams?.page ? + searchParams.page : 1}
                      isNext={serverProducts.isNext}
                    />
                </div>
      </div>
      </div>
  </section>
  )
}


export default page