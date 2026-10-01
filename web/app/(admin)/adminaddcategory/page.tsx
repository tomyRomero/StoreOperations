import React from 'react'
import AddCategoryForm from '@/components/forms/AddCategoryForm';

export default function page() {

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <AddCategoryForm category={null} />
    </section>
  )
}
