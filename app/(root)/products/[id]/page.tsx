import ProductDetails from '@/components/cards/ProductDetails'
import { findProductWithDeal, getAllProductsWithoutSort, insideCart } from '@/lib/actions/store.actions'
import React from 'react'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { id: string } }) => {

  const product = await findProductWithDeal(params.id)

  const serverProducts= await getAllProductsWithoutSort(
    1,
    4, 
    [product?.category],
    params.id
  )

  const session = await getServerSession(authOptions);

  const userId = session?.user.id

  let result = false
  if(userId)
  result = await insideCart(userId, params.id)

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
  )
}

export default page


