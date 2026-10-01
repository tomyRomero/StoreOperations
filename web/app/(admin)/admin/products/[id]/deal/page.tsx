import React from 'react'
import MakeDealForm from '@/components/forms/MakeDealForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminProduct } from '@/lib/data/admin-catalog';

const page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const product = await getAdminProduct(Number(params.id));

  return (
    <section className="">
      {product && !product.archivedAtUtc ? <MakeDealForm product={product} /> : <ErrorMessage />}
    </section>
  )
}

export default page
