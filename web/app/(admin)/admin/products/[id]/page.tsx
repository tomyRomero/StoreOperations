import React from 'react'
import AddProductForm from '@/components/forms/AddProductForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategories, getAdminProduct } from '@/lib/data/admin-catalog';

export default async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const [product, categories] = await Promise.all([getAdminProduct(Number(params.id)), getAdminCategories()])

  return (
    <section className="">
      {/* A new version of the product (after a conflict) starts the form again from it */}
      {product && categories
        ? <AddProductForm key={product.rowVersion} product={product} categories={categories} />
        : <ErrorMessage />}
    </section>
  )
}
