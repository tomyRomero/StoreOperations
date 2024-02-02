"use client"

import { ChangeEvent, useEffect, useState } from "react";
import { useForm} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  FormMessage
} from "@/components/ui/form";
import { getRes} from "@/lib/s3";
import { toast } from "../ui/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { revalidate } from "@/lib/actions/admin.actions";
import { CategoryType } from "@/app/types/global";


export default function AddCategoryForm({title, photo, id }: CategoryType) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState("/assets/image.png");
  const [imgChanged, setImgChanged] = useState(false);

  const path = usePathname();
  const router = useRouter();

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

  const FormSchema = z.object({
    photo: z.string()
    .min(1, 'Photo is required'),
    title: z
      .string()
      .min(1, 'Category Title is required')
      .min(3, 'Gategory Title must have than more 3 characters'),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: title.length > 0? title : "",
      photo: photo.length > 0? photo : ""
    },
  });


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);

    const response = await fetch('/api/category', {
      method: 'POST', 
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        id: id,
        title: values.title,
        photo: values.photo,
        imgChanged: imgChanged
      })
     })

    if(response.ok)
    {
      toast({
        title: "Success!",
        description: "Added New/Edited Category", 
      })

      revalidate(path)
      setTimeout(() => {
        router.push('/admincategories');
      }, 1500);

    }else{
      setLoading(false)
       toast({
        title: "Failed to Add/Edit Category",
        description: "Something went wrong!", 
        variant: "destructive",
      })
      }
    } 
  

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

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Link href={'/admincategories'} className="w-0">
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
      <h1 className="text-heading4-bold font-bold text-center mb-6">Add New Category</h1>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}
           encType="multipart/form-data"
          >
          <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Category Title</FormLabel>
              <FormControl>
              <Input
                type="text"
                placeholder="Enter Category Title"
                {...field}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />
            <div className="py-4">
              <FormField
              control={form.control}
              name='photo'
              render={({ field }) => (
            <FormItem className="space-y-2 flex items-center gap-2">
              <FormLabel className='account-form_image-label'>
              <Image
                      src={img}
                      alt='category image'
                      width={96}
                      height={96}
                      className='object-contain rounded-lg'
                    />
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-black'>
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
            </div>
            <Button className="w-full" type="submit">
              {id.length > 0 ? "Edit Category" : "Add Category"}
            </Button>
            <Image
              src={"/assets/spinner.svg"}
              alt={"loader"}
              width={100}
              height={100}
              className={`${loading? "" : "hidden"} mx-auto`}
            />
          </form>
        </Form>
    </div>
  );
}

