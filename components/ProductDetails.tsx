"use client"

import { Button } from "@/components/ui/button"
import { ProductType } from "@/app/types/global"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getRes } from "@/lib/s3"
import { useRouter } from "next/navigation"

const ProductDetails = ({stripeProductId, name, description, stock, photo, price, category}: ProductType)=> {

    const [img, setImg] = useState("/assets/spinner.svg")
    const router = useRouter();

    useEffect(() => { 
    
      const loadProductImage = async () => {
      console.log("Photo: ", photo)
      
      setImg(await getRes(photo))
    }
  
    loadProductImage()
  
  }, [])

  const goBack = ()=> {
    router.back();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start mx-auto pt-4">
      <div className="flex lg:hidden mb-4">
         <Button className="flex px-2 border border-black" variant="ghost" onClick={goBack}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
      <div className="flex items-start lg:hidden">
          <h1 className="font-bold text-heading3-bold">{name}</h1>
          <div className="text-heading3-bold font-bold ml-auto">${price}</div>
        </div>
        <div className="flex items-start lg:hidden">
          <small className="text-body-semibold leading-none text-gray-500">{category.toLocaleLowerCase()}</small>
          <h4 className={`ml-auto ${Number(stock) > 0 ? "text-green-500" : "text-red-500"}` }>{Number(stock) > 0 ? "In Stock" : "Out of stock"}</h4>
        </div>
        <div className="lg:hidden">
          <p className="text-body-semibold">
            {description}
          </p>
        </div>
        <Button className="flex px-6 border border-black lg:hidden w-3/4 mx-auto" variant="ghost">
          <span className="ml-2">Add To Cart</span>
        </Button>
      <div className="grid lg:grid-cols-5 gap-3 items-start">
        <div className="lg:col-span-4">
          <Image
            alt="Product Image"
            className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden max-h-[450px]"
            height={400}
            src={img}
            width={600}
            priority
          />
        </div>
      </div>
      <div className="grid gap-4 lg:gap-10 items-start">
        <div className="flex mb-4 max-lg:hidden">
        <Button className="flex px-2 border border-black" variant="ghost" onClick={goBack}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
        <div className="hidden lg:flex items-start">
          <div className="grid gap-3">
            <h1 className="text-heading3-bold font-bold">{name}</h1>

        <div className="flex flex-col">
        <small className="text-body-semibold leading-none text-gray-500">{category.toLocaleLowerCase()}</small>
        <h4 className={`${Number(stock) > 0 ? "text-green-500" : "text-red-500"} pt-2` }>{Number(stock) > 0 ? "In Stock" : "Out of stock"}</h4>
        </div>
          </div>
          <div className="text-heading3-bold font-bold ml-auto">${price}
          </div>
        </div>
        <div>
        <p className="text-body-semibold max-lg:hidden">
            {description}
        </p>
        </div>
        <Button className="flex px-6 border border-black w-3/4 mx-auto max-lg:hidden" variant="ghost">
          <span className="ml-2">Add To Cart</span>
        </Button>
      </div>
    </div>
  )
}

export default ProductDetails