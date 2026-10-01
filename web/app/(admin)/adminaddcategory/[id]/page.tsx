import React from 'react'
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategory } from '@/lib/data/admin-catalog';

export default async function page({ params }: { params: { id: string } }) {

  const category = await getAdminCategory(Number(params.id))

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
      {category ? <AddCategoryForm category={category} /> : <ErrorMessage />}
    </section>
  )
}
