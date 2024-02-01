"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { getRes} from "@/lib/s3";
import { toast } from "../ui/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { getAllCategoriesForProduct, revalidate } from "@/lib/actions/user.actions";
import { ProductType } from "@/app/types/global"

export default function AddProductForm({stripeProductId, name, description, stock, price, category, photo}: ProductType) {
  const [categories, setCategories]= useState<string[]>([])
  const [dataFetched, setDataFetched]= useState(false)
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState("/assets/image.png");
  const [imgChanged, setImgChanged] = useState(false);
  const bottomFormRef = useRef<HTMLImageElement | null>(null);

  const path = usePathname();
  const router = useRouter();

  const scrollTobottom = () => {
    bottomFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(()=> {
    const fetchData = async () => {
      if(photo.length > 0)
      {
      const fetched = await getRes(photo)
      if(fetched)
      {
        setImg(fetched)
      }
    }
    }
    revalidate(path)
    fetchData();
  }, [])

  useEffect(()=> {
    const getData = async ()=> {

      setCategories(await getAllCategoriesForProduct())
      setDataFetched(true)
    }

    getData()
  }, [])

  const FormSchema = z.object({
    name: z.
    string()
    .min(1, 'Product Name is required')
    .min(3, 'Product Name must have than more 3 characters'),
    description: z
      .string()
      .min(1, 'Product Description is required')
      .min(3, 'Product Description must have than more 5 characters'),
      stock: z.string()
      .min(1, 'Stock is required')
      .refine((value) => {
        const numericValue = Number(value);
        return !isNaN(numericValue) && Number.isInteger(numericValue) && numericValue > 0 && numericValue <= 100;
      }, {
        message: 'Stock must be a valid integer between 1 and 100',
      }),    
    price: z
      .string()
      .min(1, 'Price is required')
      .refine((value) => {
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue > 0 && numericValue <= 1000;
      }, {
        message: 'Price must be a valid number between 1 and 1000',
      }),
    category: z
    .string({
      required_error: "Please select an category to display.",
    })
    .min(1, 'Category is required , if no categories exist please create one'),
    photo: z.string()
    .min(1, 'Photo is required'),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
    name: name.length > 0?  name: "", 
    description: description.length > 0?  description: "",
    stock: stock.length > 0 ? stock: "",
    price: price.length > 0 ?  price: "",
    category: category.length > 0?  category: "",
    photo: photo.length > 0?  photo: ""
    },
  });

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
        setImg(imageDataUrl);
        setImgChanged(true)
      };

      fileReader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);
    scrollTobottom();

    const response = await fetch('/api/product', {
      method: 'POST', 
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        id: stripeProductId,
        name: values.name,
        description: values.description,
        stock: values.stock,
        price: values.price,
        category: values.category,
        photo: values.photo,
        imgChanged: imgChanged
     })
    })

    if(response.ok)
    {
      toast({
        title: "Success!",
        description: "Added New/Edited Product", 
      })

      revalidate(path)
      setTimeout(() => {
        router.push('/adminproducts');
      }, 1500);

    }else{
      setLoading(false)
       toast({
        title: "Failed to Add/Edit Product",
        description: "Something went wrong!", 
        variant: "destructive",
      })
      }
  }
  
  return (
    <>
    {dataFetched ? (
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
      <h1 className="text-heading4-bold font-bold text-center mb-6">Add New Product</h1>
      <div className="flex flex-col">
      <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
           encType="multipart/form-data"
          >
          <FormField
           control={form.control}
           name='name'
           render={({ field }) => (
            <FormItem className="space-y-2 pb-3">
              <FormLabel>Product Name</FormLabel>
              <FormControl>
               <Input type="text" placeholder="Enter product name" 
              {...field}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
           )}
        />
        <FormField
           control={form.control}
           name='description'
           render={({ field }) => (
        <FormItem className="space-y-2 pb-3">
          <FormLabel>Product Description</FormLabel>
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
           name='stock'
           render={({ field }) => (
          <FormItem className="space-y-2 pb-3">
            <FormLabel>Stock</FormLabel>
            <FormControl>
            <Input
              placeholder='Enter how much is in stock'
              {...field}
            />
            </FormControl>
            <FormMessage />
          </FormItem>
           )}
        />
        <FormField
           control={form.control}
           name='price'
           render={({ field }) => (
          <FormItem className="space-y-2 pb-3">
            <FormLabel>Product Price</FormLabel>
            <FormControl>
            <Input
              placeholder='Enter product price'
              {...field}
            />
            </FormControl>
            <FormMessage />
          </FormItem>
           )}
        />
         <FormField
           control={form.control}
           name='category'
           render={({ field }) => (
        <FormItem className="space-y-2 pb-3">
          <FormLabel>Product Category</FormLabel>
          <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a catgory for the product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category, index)=> (
                    <SelectItem key={index} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
           )}
        />
          <FormField
           control={form.control}
           name='photo'
           render={({ field }) => (
          <FormItem className="space-y-2 pb-3 flex items-center gap-2">
            <FormLabel className='account-form_image-label'>
                <Image
                      src={img}
                      alt='category image'
                      width={96}
                      height={96}
                      className='object-contain rounded-lg'
                    />
            </FormLabel>
            <FormControl>
            <Input
                type='file'
                accept='image/*'
                placeholder='Add category photo'
                className='account-form_image-input'
                onChange={(e) => handleImage(e, field.onChange)}
            />
            </FormControl>
            <FormMessage />
          </FormItem>
            )}
        />
          <Image
              ref={bottomFormRef}
              src={"/assets/spinner.svg"}
              alt={"loader"}
              width={100}
              height={100}
              className={`${loading? "" : "hidden"} mx-auto`}
            />
        <Button className="w-full" type="submit">
          {stripeProductId.length > 0 ? "Edit Product" : "Add Product"}
        </Button>
      </form>
      </Form>
      </div>
    </div>
    ) : (
      <h1>Loading...</h1>
    )}
    </>
  )
}

