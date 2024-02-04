import React from 'react'
import CategoryFormWrapper from '@/components/forms/CategoryFormWrapper';

export default async function page({ params }: { params: { id: string } }) {

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <CategoryFormWrapper id={params.id} />
    </section>
  )
}
