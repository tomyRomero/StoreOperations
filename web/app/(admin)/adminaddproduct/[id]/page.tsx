import React from 'react'
import AddProductForm from '@/components/forms/AddProductForm';
import ErrorMessage from '@/components/shared/Error';
import { getAdminCategories, getAdminProduct } from '@/lib/data/admin-catalog';

export default async function page({ params }: { params: { id: string } }) {

  const [product, categories] = await Promise.all([getAdminProduct(Number(params.id)), getAdminCategories()])

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
      {/* A new version of the product (after a conflict) starts the form again from it */}
      {product && categories
        ? <AddProductForm key={product.rowVersion} product={product} categories={categories} />
        : <ErrorMessage />}
    </section>
  )
}
