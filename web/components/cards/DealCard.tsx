import Link from 'next/link'
import React from 'react'
import Image from 'next/image';
import type { Product } from '@/lib/api/types';
import { formatMoney } from '@/lib/money';

const DealCard = ({ product }: { product: Product }) => {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden">
    <Image
      alt={`${product.name} deal`}
      className="w-full h-64 object-cover"
      height="300"
      src={product.imageUrl}
      style={{
        aspectRatio: "500/300",
        objectFit: "cover",
      }}
      width="500"
    />
    <div className="p-6">
      <h3 className="font-bold">{product.name}
        {product.compareAtPriceCents !== null && <span className='text-red-500 line-through'> {formatMoney(product.compareAtPriceCents)}</span>}
        <span className='text-green-500'> {formatMoney(product.priceCents)}</span>
      </h3>
      <p className="text-gray-500">{product.dealDescription}</p>
      <Link
        className={`inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-medium text-gray-50 
        shadow transition-colors hover:bg-white  hover:text-black focus-visible:outline-none 
         mt-4`}
        href={`/products/${product.id}`}
      >
        View Deal
      </Link>
    </div>
  </div>
  )
}

export default DealCard
