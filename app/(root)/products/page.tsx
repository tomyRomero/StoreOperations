
import Filters from '@/components/shared/Filter'
import React from 'react'
import Products from '@/components/shared/Products'
import { getAllCategories } from '@/lib/actions/user.actions'

const page = async () => {
  const products = [
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 25.99, 
      category: "Paint"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 20.50, 
      category: "Canvases"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Canvases"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 60.99, 
      category: "Paint"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 10.00, 
      category: "Brushes"
    },
  ]

  const data = await getAllCategories()
  const categories:any = []

  data.forEach(element => {
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
      <Products serverProducts={products}/>
    </div>
  </section>
  )
}


export default page