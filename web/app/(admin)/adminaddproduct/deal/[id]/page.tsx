import React from 'react'
import MakeDealForm from '@/components/forms/MakeDealForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminProduct } from '@/lib/data/admin-catalog';

const page = async ({ params }: { params: { id: string } }) => {

  const product = await getAdminProduct(Number(params.id));

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
      {product && !product.archivedAtUtc ? <MakeDealForm product={product} /> : <ErrorMessage />}
    </section>
  )
}

export default page
