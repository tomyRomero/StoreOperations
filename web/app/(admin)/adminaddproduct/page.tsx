import React from 'react'
import AddProductForm from '@/components/forms/AddProductForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategories } from '@/lib/data/admin-catalog';

export default async function page() {

  const categories = await getAdminCategories()

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      {categories ? <AddProductForm product={null} categories={categories} /> : <ErrorMessage />}
    </section>
  )
}
