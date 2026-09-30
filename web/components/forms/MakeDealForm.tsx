"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { useForm} from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { revalidate } from "@/lib/actions/admin.actions";
import { makeDeal } from "@/lib/actions/store.actions";
import { getRes } from "@/lib/s3";

interface DealProps{
    stripeProductId: string;
    name: string;
    price: string;
    photo: string;
    stock: string;
    description: string;
}


const AddProductForm = ({stripeProductId, name, price, stock, photo, description}: DealProps) => {
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState("/assets/spinner.svg")

  useEffect(() => { 
    const loadProductImage = async () => {
    
    setImg(await getRes(photo))
  }

  loadProductImage()

}, [])

  const path = usePathname();
  const router = useRouter();

  const FormSchema = z.object({
    dealDescription: z
      .string()
      .min(1, 'Deal Description is required')
      .min(3, 'Deal Description must have than more 5 characters'), 
    dealPrice: z
      .string()
      .min(1, 'Price is required')
      .refine((value) => {
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue > 0 && numericValue < Number(price);
      }, {
        message: `Price must be a valid number and less than current price ${price}`,
      }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
    dealPrice: "", 
    dealDescription:  ""
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);

    const dealMade = await makeDeal(stripeProductId, values.dealPrice, values.dealDescription)

    if(dealMade)
    {
      toast({
        title: "Success!",
        description: "Made New Deal", 
      })

      revalidate(path)
      setTimeout(() => {
        router.push('/adminproducts');
      }, 1500);

    }else{
      setLoading(false)
       toast({
        title: "Failed to Make new Deal",
        description: "Something went wrong!", 
        variant: "destructive",
      })
      }
  }
  
  return (
    <>
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
      <h1 className="text-heading4-bold text-center mb-6">Make Deal For Product</h1>
      <h1 className="text-heading4-bold text-center">{name}</h1>
      <p className="text-green-400 font-bold text-center">${price}</p>
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

      <div className="flex flex-col">
      <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
           encType="multipart/form-data"
          >
        <FormField
           control={form.control}
           name='dealDescription'
           render={({ field }) => (
        <FormItem className="space-y-2 pb-3">
          <FormLabel>Deal Description</FormLabel>
          <FormControl>
             <Textarea placeholder="Enter product description" 
             {...field}
             />
          </FormControl>
          <FormMessage />
        </FormItem>
           )}
         />
        <FormField
           control={form.control}
           name='dealPrice'
           render={({ field }) => (
          <FormItem className="space-y-2 pb-3">
            <FormLabel>Deal Price</FormLabel>
            <FormControl>
            <Input
              placeholder='Enter deal price'
              {...field}
            />
            </FormControl>
            <FormMessage />
          </FormItem>
           )}
        />
          <Image
              src={"/assets/spinner.svg"}
              alt={"loader"}
              width={100}
              height={100}
              className={`${loading? "" : "hidden"} mx-auto`}
            />
        <Button className="w-full" type="submit">
          {"Make Deal"}
        </Button>
      </form>
      </Form>
      </div>
    </div>
    </>
  )
}

export default AddProductForm;