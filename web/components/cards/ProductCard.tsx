import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/api/types'
import { formatMoney } from '@/lib/money'
import { Button } from '../ui/button'

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link className="" href={`/products/${product.id}`}>
    <div className="relative group bg-gray-100 p-4 xl:p-4 max-sm:px-8 rounded-xl">

      <Image
            alt={`Product ${product.name} Image`}
            className="rounded-lg object-cover w-full aspect-square group-hover:opacity-80 transition-opacity max-sm:aspect-[4/3] px-6 py-2"
            height={150}
            src={product.imageUrl}
            width={300}
      />
    <div className="flex-1 py-2 ml-6">
      <h3 className="font-semibold tracking-tight">{product.name}</h3>
      <small className="text-body-semibold leading-none text-gray-500">{product.categoryName}</small>
      <h4 className="font-semibold">{formatMoney(product.priceCents)}</h4>
      <h4 className={` ${product.stock > 0 ? "text-green-500" : "text-red-500"}` }>{product.stock > 0 ? "In Stock" : "Out of stock"}</h4>
      <div className='py-0.5'>
      <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg  hover:text-black hover:bg-gray-200">View Details</Button>
      </div>
    </div>
  </div>
  </Link>
  )
}

export default ProductCard
