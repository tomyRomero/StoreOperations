import React from 'react';
import Link from 'next/link';
import CategoryCard from './cards/CategoryCard';

interface Category{
    id: string,
    media: string,
    title: string
}

const Categories = () => {

const categoriesList = [
{
    id: "1",
    media: "/assets/categories/canvas.jpg",
    title: "Canvases"
},
{
    id: "2",
    media: "/assets/categories/brushes.jpg",
    title: "Brushes"
},
{
    id: "3",
    media: "/assets/categories/paint.jpg",
    title: "Paint"
},
]

  return (
    <section className="px-8 md:px-16 lg:px-24 xl:px-36 mt-10 lg:mt-14 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h3 className="mr-auto font-light text-heading3-bold">Shop by Categories</h3>
        <Link href="/products">
          <div className="text-black text-body-semibold hover:underline">Show All</div>
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {categoriesList.map((category: Category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};

export default Categories;
