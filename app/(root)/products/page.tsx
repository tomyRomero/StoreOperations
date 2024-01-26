
import Filters from '@/components/shared/Filter'
import React from 'react'
import Products from '@/components/shared/Products'

const page = () => {
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



  return (
    <section className="mt-14 lg:mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20">
    <div className="grid xl:grid-cols-4 gap-10 items-start">
      <Filters serverProducts={products}/>
      <Products serverProducts={products}/>
    </div>
  </section>
  )
}


export default page