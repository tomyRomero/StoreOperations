import React from 'react';
import Link from 'next/link';
import CategoryCard from './cards/CategoryCard';

interface Category{
    id: string,
    photo: string,
    title: string
}

const Categories = ({data}: any) => {
  if(!data || data.length === 0)
  {
    return null;
  }

  return (
    <section className="px-8 md:px-16 lg:px-24 xl:px-36 mt-10 lg:mt-14 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h3 className="mr-auto font-light text-heading3-bold">Shop by Categories</h3>
        <Link href="/products">
          <div className="text-black text-body-semibold hover:underline">Show All</div>
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
      {data.length > 0 && (
        <>
          {data.map((category: Category, index: any) => (
            <CategoryCard key={index} category={category} />
          ))}
        </>
      )} 
      </div>
    </section>
  );
};

export default Categories;
