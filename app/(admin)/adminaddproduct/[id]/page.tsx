import React from 'react'
import ProductFormWrapper from '@/components/forms/ProductFormWrapper';

export default async function page({ params }: { params: { id: string } }) {

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <ProductFormWrapper id={params.id} />
    </section>
  )
}
