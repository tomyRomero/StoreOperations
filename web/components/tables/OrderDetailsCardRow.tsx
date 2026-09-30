"use client"

import React, { useEffect, useState } from 'react'
import {TableRow,  TableCell} from "@/components/ui/table"
import Image from 'next/image'
import { findProduct } from '@/lib/actions/store.actions';
import { getRes } from '@/lib/s3';

interface Props{
  
productId: string;
quantity: number;
productName: string;
productImage: string;
productPrice: string;
}

const OrderDetailsCardRow = ({productId, productName, quantity, productImage, productPrice} : Props) => {

    const [img, setImg]= useState("/assets/spinner.svg")


    useEffect(()=> {
        const fetchImage = async ()=> {

            setImg( await getRes(productImage))
         }

        fetchImage();

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
    <TableCell className="font-medium">{productId}</TableCell>
    <TableCell className="font-medium">{productName}</TableCell>
    <TableCell>{quantity}</TableCell>
    <TableCell>${productPrice}</TableCell>
    <TableCell>${(Number(productPrice) * quantity).toFixed(2)}</TableCell>
  </TableRow>
  )
}

export default OrderDetailsCardRow