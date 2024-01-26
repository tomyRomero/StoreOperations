
import Filters from '@/components/shared/Filter'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
      price: 24.99, 
      category: "Brushes"
    },
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
      price: 24.99, 
      category: "Brushes"
    },
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
      price: 24.99, 
      category: "Brushes"
    },
  ]

  return (
    <section className="mt-14 lg:mt-14 mx-auto px-4 md:px-14 py-8 lg:px-20">
    <div className="grid xl:grid-cols-4 gap-10 items-start">
    
      <Filters />
      
      <div className=" xl:col-span-3 lg:mt-14 grid gap-6 md:gap-8 max-sm:p-0">
        <h4 className='text-body-bold'>Showing 1 - 3 of 3 Docs</h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index)=> (
               <div key={index} className="relative group bg-gray-100 p-4 xl:p-4 max-sm:px-8 rounded-xl hover:bg-black hover:text-white">
               <Link className="absolute inset-0" href={`/products/${product.id}`}>
                 <span className="sr-only">View</span>
               </Link>
               <Image
                 alt={`Product ${product.title} Image`}
                 className="rounded-lg object-cover w-full aspect-square group-hover:opacity-80 transition-opacity max-sm:aspect-[4/3] p-6"
                 height={150}
                 src={`${product.image}`}
                 width={300}
               />
               <div className="flex-1 py-4 ml-6">
                 <h3 className="font-semibold tracking-tight">{product.title}</h3>
                 <small className="text-body-semibold leading-none text-gray-500">{product.category}</small>
                 <h4 className="font-semibold">${product.price}</h4>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  )
}


export default page