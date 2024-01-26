"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AppProvider, useAppContext } from '@/lib/AppContext'

interface Products{
    title: string,
    id: string,
    image: string,
    price: number, 
    category: string
}

const Products = ({serverProducts}: any) => {
    const {globalProducts} = useAppContext()
    const [products, setProducts] = useState(serverProducts);

    useEffect(
    ()=> {
        setProducts(globalProducts)
    }
    , [globalProducts])

  return (
    <div className=" xl:col-span-3 lg:mt-14 grid gap-6 md:gap-8 max-sm:p-0">
    <h4 className='text-body-bold'>Showing 1 - 3 of 3 Docs</h4>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product: any, index: any)=> (
           <div key={index} className="relative group bg-gray-100 p-4 xl:p-4 max-sm:px-8 rounded-xl hover:bg-black hover:text-white">
           <Link className="absolute inset-0" href={`/products/${product.id}`}>
             <span className="sr-only text-black">View</span>
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
  )
}

export default Products