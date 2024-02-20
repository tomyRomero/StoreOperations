import DeleteDeal from '@/components/cards/DealDetails';
import MakeDealForm from '@/components/forms/MakeDealForm';
import ErrorMessage from '@/components/shared/Error';
import { findProductForDeal } from '@/lib/actions/store.actions';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({ params }: { params: { id: string } }) => {

    const product = await findProductForDeal(params.id);

    if(!product)
    {
      return(
        <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
            <ErrorMessage />
        </section>
      )
    }

if(product){

  if(product.deal === true)
  {
    return(
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
      <DeleteDeal
       stripeProductId={product.stripeProductId}
       name={product.name} 
       price={product.price} 
       photo={product.photo} 
       stock={product.stock} 
       oldPrice={product.oldPrice}
       dealDescription={product.dealDescription}
       description={product.description}
       />  
    </section>
    )
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
        <MakeDealForm 
        stripeProductId={product.stripeProductId} 
        name={product.name} 
        price={product.price} 
        photo={product.photo} 
        stock={product.stock}
        description={product.description} />
    </section>
  )
}
}

export default page