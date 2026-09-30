
import React from 'react'
import AddProductForm from '@/components/forms/AddProductForm';

export default async function page() {

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
     
       <AddProductForm stripeProductId={""} name={""} description={""} stock={""} price={""} category={""} photo={""}/>

    </section>
  )
}

