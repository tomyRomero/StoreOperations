"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'
import { TableRow, TableCell} from "@/components/ui/table"
import { getRes } from '@/lib/s3'
import { deleteCategoryById } from '@/lib/actions/user.actions'
import { toast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { CategoryType } from '@/app/types/global'


const CategoryRow = ({id, photo, date, title}: CategoryType) => {
  const [img, setImg] = useState("/assets/spinner.svg")
  const router = useRouter();
  
  useEffect(() => { 
    const loadCategoryImage = async () => {
    
    setImg(await getRes(photo))
  }

  loadCategoryImage()

}, [])

const deleteCategory = async () => {

  const userConfirmed = window.confirm(`Are you sure you want to delete this category?`);
  if(userConfirmed)
  {
    const deleted = await deleteCategoryById(id)

    if(deleted)
      {
        toast({
          title: "Success!",
          description: "Category Delete", 
        })
  
      }else{
         toast({
          title: "Failed to Delete Category",
          description: "Something went wrong!", 
          variant: "destructive",
        })
    }
  }
}
    
const redirect = () => {
  router.push(`/adminaddcategory/${id}`)
}

  return (
    <TableRow>
      <TableCell>
        <Image
          alt="Category image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={img}
          width="64"
        />
      </TableCell>
        <TableCell className="font-medium">{id}</TableCell>
        <TableCell className="">{title}</TableCell>
        <TableCell className="">{date}</TableCell>
        <TableCell>
      <div className='flex'>
        <Button size="sm" variant="outline" onClick={redirect}>
        Edit
       </Button>
        <Button className="ml-2" size="sm" variant="outline" onClick={deleteCategory}>
        Delete
      </Button>
      </div>
    </TableCell>
  </TableRow>
  )
}

export default CategoryRow