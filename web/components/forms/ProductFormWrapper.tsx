"use client"

import React, { useEffect, useState } from 'react'
import { findProduct } from '@/lib/actions/store.actions'
import AddProductForm from './AddProductForm'
import Loading from '@/app/(auth)/loading'

const ProductFormWrapper = ({id}: any) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [stock, setStock] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [photo, setPhoto] = useState("")
    const [dataFetched, setDataFetched] = useState(false)

    useEffect(()=> {
        const getData = async ()=> {
            try{
                const product = await findProduct(id)
                if(product)
                {   
                    setName(product.name)
                    setDescription(product.description)
                    setStock(product.stock.toString())
                    setPrice(product.price.toString())
                    setCategory(product.category)
                    setPhoto(product.photo)
                }
            }catch(error)
            {
             console.log(`error: ${error}`)
            }finally{
                setDataFetched(true)
            }
        }
        getData()
    }, [])

  return (
    <>
    {dataFetched ? (
        <AddProductForm stripeProductId={id} name={name} description={description} stock={stock} price={price} category={category} photo={photo}/>
    ): <Loading />}
    </>
  )
}

export default ProductFormWrapper