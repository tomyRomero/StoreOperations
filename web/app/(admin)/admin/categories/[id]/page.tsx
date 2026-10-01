import React from 'react'
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategory } from '@/lib/data/admin-catalog';

export default async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const category = await getAdminCategory(Number(params.id))

  return (
    <section className="">
      {category ? <AddCategoryForm category={category} /> : <ErrorMessage />}
    </section>
  )
}
