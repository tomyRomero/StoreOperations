import ProductDetails from '@/components/ProductDetails'
import { findProduct, getAllProductsWithoutSort } from '@/lib/actions/user.actions'
import React from 'react'
import ProductCard from '@/components/cards/ProductCard'

const page = async ({ params }: { params: { id: string } }) => {

  const product = await findProduct(params.id)

  const serverProducts= await getAllProductsWithoutSort(
    1,
    4, 
    [product?.category],
    params.id
  )

  return (
    <section className="mt-14 max-sm:mt-12 mx-auto px-4 md:px-14 pt-14 lg:px-20">
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
        />
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-heading3-bold font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            </div>
            </div>
        </div>
       )}
       {!product &&
       <h1>No Product Found</h1>
       }
    </section>
  )
}

export default page


