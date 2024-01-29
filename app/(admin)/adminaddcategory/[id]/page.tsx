import React from 'react'
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from 'next-auth';
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import { findCategory } from '@/lib/actions/user.actions';
import FormWrapper from '@/components/forms/FormWrapper';

export default async function page({ params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions);

  if(session === undefined || session?.user.admin === false)
  {
    redirect("/")
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <FormWrapper id={params.id} />
    </section>
  )
}
