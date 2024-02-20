import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { getRes } from '@/lib/s3';

interface Props{
    id: string;
    photo: string;
    name: string;
    oldPrice: string;
    price: string;
    dealDescription: string;
}

const DealCard = ({id, photo , name, oldPrice, price, dealDescription}: Props) => {
  const [img, setImg] = useState("/assets/spinner.svg")

  useEffect(()=> {

    const getImage = async ()=> {
      setImg(await getRes(photo))
    }

    getImage();
  }, [])

  return (
    <div className="rounded-lg shadow-lg overflow-hidden">
    <Image
      alt="Deal Image"
      className="w-full h-64 object-cover"
      height="300"
      src={img}
      style={{
        aspectRatio: "500/300",
        objectFit: "cover",
      }}
      width="500"
    />
    <div className="p-6">
      <h3 className="font-bold">{name} <span className='text-red-500 line-through'> {oldPrice}</span> <span className='text-green-500'> {price}</span> </h3>
      <p className="text-gray-500">{dealDescription}</p>
      <Link
        className={`inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-medium text-gray-50 
        shadow transition-colors hover:bg-white  hover:text-black focus-visible:outline-none 
         mt-4`}
        href={`/products/${id}`}
      >
        View Deal
      </Link>
    </div>
  </div>
  )
}

export default DealCard