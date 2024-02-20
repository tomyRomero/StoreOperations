"use client"

import { ProductType } from "@/app/types/global"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell} from "@/components/ui/table"
import { getRes } from "@/lib/s3"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "../ui/use-toast"
import { revalidate } from "@/lib/actions/admin.actions"
import {deleteProductById} from "@/lib/actions/store.actions"


const ProductRow = ({stripeProductId, name, description, stock, price, category, photo, date, deal}: ProductType) => {
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

const redirectDeal  = ()=> {
  router.push(`/adminaddproduct/deal/${stripeProductId}`)
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
            priority
          />
        </TableCell>
        <TableCell className="font-bold">{name}</TableCell>
        <TableCell>
            <div className='flex'>
             <Button size="sm" variant="outline" onClick={redirect}>
               Edit
             </Button>
             {deal === true ? ( <Button className="ml-2"  size="sm" variant="outline" onClick={redirectDeal}>
               View Deal
             </Button>) : (<Button className="ml-2"  size="sm" variant="outline" onClick={redirectDeal}>
               Make Deal
             </Button>)}
             <Button className="ml-2" size="sm" variant="outline" onClick={deleteProduct}>
               Delete
             </Button>
             </div>
           </TableCell>
        <TableCell className={`text-center font-bold ${stock === "0" ? "text-red-400" : ""}`}>{stock}</TableCell>
        <TableCell className="text-center font-bold text-green-600">{`$${price}`}</TableCell>
        <TableCell>{stripeProductId}</TableCell>
        <TableCell className="font-semibold">{category}</TableCell>
        <TableCell>{date}</TableCell>
      </TableRow>
  )
}

export default ProductRow;