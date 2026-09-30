import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/api/types';

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link href={`/products?categories=${category.id}`} className='bg-gray-100 w-full px-10 py-6 rounded-lg max-sm:px-16 md:px-4 xl:px-20 lg:py-8 max-xxs:px-4'>
    <div className="flex flex-col items-center">
          <Image
            alt={category.name}
            className="object-cover w-full h-60 rounded-lg max-sm:aspect-[4/3]"
            height={300}
            src={category.imageUrl}
            style={{
              aspectRatio: "300/300",
              objectFit: "cover",
            }}
            width={300}
            loading="lazy"
          />

          <h3 className="text-body-bold mt-4 bg-black text-white py-2 rounded-md w-full text-center">{category.name}</h3>

    </div>
    </Link>
  );
};

export default CategoryCard;
