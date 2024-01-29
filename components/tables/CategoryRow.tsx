"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'
import { TableRow, TableCell} from "@/components/ui/table"
import { getRes } from '@/lib/s3'
import { deleteCategoryById } from '@/lib/actions/user.actions'
import { toast } from '../ui/use-toast'

interface Props{
  id: string;
  image: string;
  date: string;
  title: string;
}


const CategoryRow = ({id, image, date, title}: Props) => {
  const [img, setImg] = useState("/assets/spinner.svg")
  
  useEffect(() => { 
    const loadCategoryImage = async () => {
    
    setImg(await getRes(image))
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
        <Link href={`/adminaddcategory/${id}`}>
        <Button size="sm" variant="outline">
        Edit
       </Button>
       </Link>
        <Button className="ml-2" size="sm" variant="outline" onClick={deleteCategory}>
        Delete
      </Button>
      </div>
    </TableCell>
  </TableRow>
  )
}

export default CategoryRow