"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { removeDeal } from '@/lib/actions/store.actions'
import { toast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { getRes } from '@/lib/s3'

interface Props {
    stripeProductId: string;
    name: string;
    price: string;
    stock: string;
    oldPrice: string;
    dealDescription: string;
    photo: string;
    description: string;
}



const DealDetails = ({stripeProductId, name, photo, price, stock, oldPrice, dealDescription ,description}: Props) => {
  const [img, setImg] = useState("/assets/spinner.svg")
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(()=> {
    const getImage = async ()=> {
     setImg(await getRes(photo))
    }

    getImage();
  }, [])

  const handleRemoveDeal = async ()=> {
   
    const userConfirmed = window.confirm(`Are you sure you want to remove this deal? Doing So Will Revert the Product to it's original price!`);
    if(userConfirmed)
      {
      setLoading(true);

      const removed = await removeDeal(stripeProductId);

      if(removed)
      {
        toast({
          title: "Success!",
          description: "Deal Removed", 
        })

        router.push("/adminproducts");
      }else{
        toast({
          title: "Failed to Remove Deal",
          description: "Something went wrong!", 
          variant: "destructive",
        })
      }

      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col max-w-lg mx-auto">
    <Link href={'/adminproducts'} className="w-0">
    <Button className="flex px-6 border border-black" variant="ghost">
        <Image
          src="/assets/back.png"
          alt="go back icon"
          width={32}
          height={32}
          className="px-1"
        />
        <span className="ml-2">Go Back</span>
      </Button>
    </Link>
    <br />
    <h1 className="text-heading4-bold text-center mb-6">Product Deal</h1>
    <h1 className="text-heading4-bold text-center">{name}</h1>
    <p className="text-red-400 font-bold text-center">Price: ${oldPrice}</p>
    <p className="text-center font-bold">Stock: {stock}</p>
    <p className='font-bold'>Product Description:</p>
    <p>{description}</p>
    <br/>
    <div className="mx-auto">
    <Image 
      src={img}
      alt="product image"
      width={250}
      height={250}
      className="rounded-xl aspect-auto"
    />
    </div>
    <br/> 
    <p className=" font-bold text-center">Deal Price: <span className='text-green-400'>${price}</span></p>
    <p className='font-bold'>Deal Description:</p>
    <p>{dealDescription}</p>
    <br/>
    <Image
              src={"/assets/spinner.svg"}
              alt={"loader"}
              width={100}
              height={100}
              className={`${loading? "" : "hidden"} mx-auto`}
      />
    <Button className='bg-black text-white border border-black' variant={"ghost"} onClick={handleRemoveDeal}>
      Remove Deal
    </Button>
  </div>
  )
}

export default DealDetails;