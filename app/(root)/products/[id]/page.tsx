import ProductDetails from '@/components/ProductDetails'
import { findProduct } from '@/lib/actions/user.actions'
import React from 'react'
import Image from 'next/image'

const page = async ({ params }: { params: { id: string } }) => {

  const product = await findProduct(params.id)

  return (
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-14 lg:px-20">
       {product && (
        <ProductDetails
        stripeProductId={params.id}
        name={product.name} 
        description={product.description} 
        stock={product.stock} 
        photo={product.photo}
        price={product.price}
        category={product.category}
       
        />
       )}
       {!product &&
       <h1>No Product Found</h1>
       }

    </section>
  )
}

export default page