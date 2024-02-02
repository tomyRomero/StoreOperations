"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductType } from '@/app/types/global'
import { getRes } from '@/lib/s3'
import { Button } from '../ui/button'

const ProductCard = ({stripeProductId, name, description, stock, price, category, photo} : ProductType) => {

  const [img, setImg] = useState("/assets/spinner.svg")

  useEffect(() => { 
    const loadProductImage = async () => {
    setImg(await getRes(photo))
  }

  loadProductImage()

}, [])

  return (
    <Link className="" href={`/products/${stripeProductId}`}>
    <div key={stripeProductId} className="relative group bg-gray-100 p-4 xl:p-4 max-sm:px-8 rounded-xl">

      <Image
            alt={`Product ${name} Image`}
            className="rounded-lg object-cover w-full aspect-square group-hover:opacity-80 transition-opacity max-sm:aspect-[4/3] px-6 py-2"
            height={150}
            src={img}
            width={300}
            priority
      />
    <div className="flex-1 py-2 ml-6">
      <h3 className="font-semibold tracking-tight">{name}</h3>
      <small className="text-body-semibold leading-none text-gray-500">{category}</small>
      <h4 className="font-semibold">${price}</h4>
      <h4 className={` ${Number(stock) > 0 ? "text-green-500" : "text-red-500"}` }>{Number(stock) > 0 ? "In Stock" : "Out of stock"}</h4>
      <div className='py-0.5'>
      <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg  hover:text-black hover:bg-gray-200">View Details</Button>
      </div>
    </div>
  </div>
  </Link>
  )
}

export default ProductCard