import ProductDetails from '@/components/cards/ProductDetails'
import { getProduct, getRelatedProducts } from '@/lib/data/catalog'
import React from 'react'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { id: string } }) => {
  const id = Number(params.id)
  const product = Number.isInteger(id) && id > 0 ? await getProduct(id) : null

  // No such product, or no longer sold
  if(!product)
  {
    redirect("/products")
  }

  const related = await getRelatedProducts(id)

  return (
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-20 lg:px-20 max-xs:pt-28">
        <ProductDetails product={product} related={related} />
    </section>
  )
}

export default page
