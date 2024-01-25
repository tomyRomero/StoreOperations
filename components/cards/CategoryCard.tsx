import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category{
    id: string,
    media: string,
    title: string
}

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
    const media = category.media;

  return (
    <Link href="/products" className={`relative rounded-xl bg-gray-200 min-h-[360]
    flex flex-col items-center justify-center cursor-pointer hover:bg-black`}>
        <Image 
        src={`${media}`}
        alt="image"
        width={300}
        height={200}
        className='p-10 max-sm:px-28 w-3/4 h-3/4 max-md:w-4/5 max-sm:py-10'
        />
        <p className="rounded-lg w-3/4 text-center bg-white mb-4 px-6 py-4">{category.title}</p>
    </Link>
  );
};

export default CategoryCard;

