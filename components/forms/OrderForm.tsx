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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useRouter, usePathname } from "next/navigation";
import { revalidate } from "@/lib/actions/admin.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { updateOrderStatus } from "@/lib/actions/store.actions";
import { toast } from "../ui/use-toast";


export default function AddCategoryForm({orderId, status, estimatedDelivery, trackingNumber}: any) {
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
      status: status ? status : "No Order Found",
      estimatedDelivery: estimatedDelivery ? estimatedDelivery : "",
      trackingNumber: trackingNumber ? trackingNumber : ""
    },
  });


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);

    try{
    const updated = await updateOrderStatus(orderId, values.status, values.estimatedDelivery, values.trackingNumber , path);

    if(updated)
    {
      toast({
        title: "Success!",
        description: "Updated Order Status!", 
      })
      
      router.push(`/adminorders/${orderId}`)
    }else{
      setLoading(false);

      toast({
        title: "Failed to Update Order!",
        description: "Something went wrong! Please try again later.", 
        variant: "destructive",
      })
    }
  }catch(error)
  {
    setLoading(false);

      toast({
        title: "Failed to Update Order!",
        description: `Something went wrong! Error: ${error}`, 
        variant: "destructive",
      })
  }


  }
   

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Link href={`/adminorders/${orderId}`} className="w-0">
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={field.value} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  <SelectItem value="Refunded">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Use this to update order status
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

            <FormField
              control={form.control}
              name='estimatedDelivery'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Estimated Delivery Date</FormLabel>
              <FormControl>
              <Input
                type="date"
                placeholder="If applicable enter an estimated delivery date"
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

