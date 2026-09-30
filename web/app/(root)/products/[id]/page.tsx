import ProductDetails from '@/components/cards/ProductDetails'
import { findProductWithDeal, getAllProductsWithoutSort } from '@/lib/data/catalog'
import { isInCurrentUserCart } from '@/lib/data/account'
import React from 'react'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { id: string } }) => {

  try{
  // Fetch product data
  const product = await findProductWithDeal(params.id)

  // Fetch server products
  const serverProducts= await getAllProductsWithoutSort(
    1,
    4, 
    [product?.category],
    params.id
  )

  // Check if the product is in the signed-in user's cart (false for guests)
  const result = await isInCurrentUserCart(params.id)

  if(!product)
  {
    redirect("/products")
  }

  return (
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-20 lg:px-20 max-xs:pt-28">
       {product && (
        <div>
        <ProductDetails
        stripeProductId={params.id}
        name={product.name} 
        description={product.description} 
        stock={product.stock} 
        photo={product.photo}
        price={product.price}
        category={product.category}
        result={result}
        serverProducts={serverProducts.results}
        deal={product.deal}
        oldPrice={product.oldPrice}
        />
        </div>
       )}
       {!product &&
       <div>
      <br></br>
       <h1 className='text-red-500'>No Product Found</h1>
       </div>
       }
    </section>
  ) }catch(error){
    return(
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-20 lg:px-20 max-xs:pt-28">
       <div>
          <br></br>
          <h1 className='text-red-500'>An Error Occurred: {String(error)}. Please Refresh the Page.</h1>
       </div>
    </section>
    )
  }
}

export default page


