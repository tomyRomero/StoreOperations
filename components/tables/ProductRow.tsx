"use client"

import { ProductType } from "@/app/types/global"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell} from "@/components/ui/table"
import { getRes } from "@/lib/s3"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "../ui/use-toast"
import { deleteProductById, revalidate } from "@/lib/actions/user.actions"


const ProductRow = ({stripeProductId, name, description, stock, price, category, photo, date}: ProductType) => {
  const [img, setImg] = useState("/assets/spinner.svg")
  const router = useRouter();

  useEffect(() => { 
    const loadProductImage = async () => {
    
    setImg(await getRes(photo))
  }

  loadProductImage()

}, [])

const redirect = () => {
  router.push(`/adminaddproduct/${stripeProductId}`)
}

const deleteProduct = async () => {

  const userConfirmed = window.confirm(`Are you sure you want to delete this product?`);
  if(userConfirmed)
  {
    const deleted = await deleteProductById(stripeProductId)

    if(deleted)
      {
        toast({
          title: "Success!",
          description: "Product Deleted", 
        })
        
        revalidate("/adminproducts")
      }else{
         toast({
          title: "Failed to Delete Product",
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
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="64"
            src={img}
            width="64"
          />
        </TableCell>
        <TableCell className="font-medium">{name}</TableCell>
        <TableCell>{stripeProductId}</TableCell>
        <TableCell>{`$${price}`}</TableCell>
        <TableCell>{category}</TableCell>
        <TableCell>{stock}</TableCell>
        <TableCell>{date}</TableCell>
        <TableCell>
            <div className='flex'>
             <Button size="sm" variant="outline" onClick={redirect}>
               Edit
             </Button>
             <Button className="ml-2" size="sm" variant="outline" onClick={deleteProduct}>
               Delete
             </Button>
             </div>
           </TableCell>
      </TableRow>
  )
}

export default ProductRow;