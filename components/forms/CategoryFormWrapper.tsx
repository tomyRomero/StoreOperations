"use client"

import React, { useEffect, useState } from 'react'
import AddCategoryForm from './AddCategoryForm'
import { findCategory } from '@/lib/actions/user.actions'

const CategoryFormWrapper = ({id}: any) => {
    const [title, setTitle] = useState("")
    const [photo, setPhoto] = useState("")
    const [dataFetched, setDataFetched] = useState(false)

    useEffect(()=> {
        const getData = async ()=> {
            try{
            const category = await findCategory(id)
            if(category)
            {
                setTitle(category.title)
                setPhoto(category.photo)
            }
        }catch(error)
        {
            console.log(`Error: ${error}`)
        }finally{
         setDataFetched(true)
        }

        }
        getData()
    }, [])

  return (
    <>
    {dataFetched ? (
        <AddCategoryForm title={title} photo={photo} id={id}/>
    ): <h1>Loading</h1>}
    </>
  )
}

export default CategoryFormWrapper