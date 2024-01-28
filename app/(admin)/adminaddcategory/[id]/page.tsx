import React from 'react'
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from 'next-auth';
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import { findCategory } from '@/lib/actions/user.actions';

export default async function page({ params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions);
  const category = await findCategory(params.id)

  if(session === undefined || session?.user.admin === false)
  {
    redirect("/")
  }

  const categoryData = {
    title: category? category?.title : "",
    photo: category? category?.photo : "",
    id: category? category?.id : ""
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
       <AddCategoryForm  title={categoryData.title} photo={categoryData.photo} id={categoryData.id}/>
    </section>
  )
}
