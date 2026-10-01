import React from 'react'
import AddProductForm from '@/components/forms/AddProductForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategories } from '@/lib/data/admin-catalog';

export default async function page() {

  const categories = await getAdminCategories()

  return (
    <section className="">
      {categories ? <AddProductForm product={null} categories={categories} /> : <ErrorMessage />}
    </section>
  )
}
