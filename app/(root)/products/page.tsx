
import Filters from '@/components/shared/Filter'
import React from 'react'
import { getAllCategories, getAllProducts } from '@/lib/actions/user.actions'
import ProductCard from '@/components/cards/ProductCard'
import { ProductType } from '@/app/types/global'

const page = async () => {
  const products= await getAllProducts()
  const categoriesData = await getAllCategories()
  const categories:any = []

  categoriesData.forEach(element => {
    categories.push({
      id: element.id,
      title: element.title
    })
  });

  console.log("Categories: ", categories)
 

  return (
    <section className="mt-14 lg:mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20">
    <div className="grid xl:grid-cols-4 gap-10 items-start">
      <Filters serverProducts={products} categoriesList={categories}/>
      <div className=" xl:col-span-3 lg:mt-14 grid gap-6 md:gap-8 max-sm:p-0">
        <h4 className='text-body-bold'>Showing 1 - 3 of 3 Docs</h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: ProductType)=> (
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
  </section>
  )
}


export default page