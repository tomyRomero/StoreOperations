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
import { useRouter, usePathname } from "next/navigation";
import { revalidate } from "@/lib/actions/admin.actions";


export default function AddCategoryForm({status,estimatedDelivery,trackingNumber}: any) {
  const [loading, setLoading] = useState(false);

  const path = usePathname();
  const router = useRouter();

  const FormSchema = z.object({
    status: z.string()
    .min(1, 'Status is required'),
    estimatedDelivery: z
      .string(),
    trackingNumber: z.string(),  
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: "",
      estimatedDelivery: "",
      trackingNumber: ""
    },
  });


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);
  }
   

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Link href={`/adminorder/${""}`} className="w-0">
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
      <h1 className="text-heading4-bold font-bold text-center mb-6">Update Order Status</h1>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}
           encType="multipart/form-data"
          >
          <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Order Status</FormLabel>
              <FormControl>
              <Input
                type="text"
                placeholder="Select Order Status"
                {...field}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />

            <FormField
              control={form.control}
              name='estimatedDelivery'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Estimated Delivery</FormLabel>
              <FormControl>
              <Input
                type="text"
                placeholder="If applicable enter an estimated delivery"
                {...field}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />
            
            <FormField
              control={form.control}
              name='trackingNumber'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Tracking Number </FormLabel>
              <FormControl>
              <Input
                type="text"
                placeholder="If applicable enter tracking number"
                {...field}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />

            <Button className="w-full" type="submit">
              Update Order
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

