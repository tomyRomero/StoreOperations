import ProductDetails from '@/components/ProductDetails'
import { findProduct, getAllProductsWithoutSort, insideCart } from '@/lib/actions/store.actions'
import React from 'react'
import ProductCard from '@/components/cards/ProductCard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const page = async ({ params }: { params: { id: string } }) => {

  const product = await findProduct(params.id)

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


  return (
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-20 lg:px-20">
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
        />
        </div>
       )}
       {!product &&
       <h1>No Product Found</h1>
       }
    </section>
  )
}

export default page


