import React from 'react'
import AddCategoryForm from '@/components/forms/AddCategoryForm';

export default async function page() {

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <AddCategoryForm title={""} photo={""} id={""} />
    </section>
  )
}
