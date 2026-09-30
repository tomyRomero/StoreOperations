"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRes } from '@/lib/s3';
import { set } from 'mongoose';

interface Category{
    id: string,
    photo: string,
    title: string
}

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {

    const [img, setImg] = useState("/assets/spinner.svg")
  
    useEffect(() => { 
      const loadCategoryImage = async () => {
      
      {
      setImg(await getRes(category.photo))
      }
  }
  
    loadCategoryImage()

  }, [])

  return (
    <Link href={`/products?categories=${category.title}`} className='bg-gray-100 w-full px-10 py-6 rounded-lg max-sm:px-16 md:px-4 xl:px-20 lg:py-8 max-xxs:px-4'>
    <div className="flex flex-col items-center">
          <Image
            alt="Category"
            className="object-cover w-full h-60 rounded-lg max-sm:aspect-[4/3]"
            height={300}
            src={img}
            style={{
              aspectRatio: "300/300",
              objectFit: "cover",
            }}
            width={300}
            loading="lazy"
          />

          <h3 className="text-body-bold mt-4 bg-black text-white py-2 rounded-md w-full text-center">{category.title}</h3>

    </div>
    </Link>
  );
};

export default CategoryCard;


