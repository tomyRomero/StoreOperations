"use client"

import React, { useEffect, useState } from 'react'
import {TableRow,  TableCell} from "@/components/ui/table"
import Image from 'next/image'
import { findProduct } from '@/lib/actions/store.actions';
import { getRes } from '@/lib/s3';

interface Props{
  
product: string;
quantity: number;

}

const OrderDetailsCardRow = ({product, quantity} : Props) => {
    const [price, setPrice] = useState(0)
    const [img, setImg]= useState("/assets/spinner.svg")
    const [name, setName] = useState("product")

    useEffect(()=> {
        const fetchProduct = async ()=> {
         const data = await findProduct(product)

         if(data)
         {
            setPrice(data.price)
            setImg( await getRes(data.photo))
            setName(data.name)
         }

        }

        fetchProduct();

    }, [])

  return (
    <TableRow>
    <TableCell>
      <Image
        alt="Product image"
        className="aspect-square rounded-md object-cover"
        height="85"
        src={img}
        width="85"
      />
    </TableCell>
    <TableCell className="font-medium">{product}</TableCell>
    <TableCell className="font-medium">{name}</TableCell>
    <TableCell>{quantity}</TableCell>
    <TableCell>${price}</TableCell>
    <TableCell>${(price * quantity).toFixed(2)}</TableCell>
  </TableRow>
  )
}

export default OrderDetailsCardRow