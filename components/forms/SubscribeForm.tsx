"use client"

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm} from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
  } from "@/components/ui/form";
import { subscribeToNewsletter } from '@/lib/actions/store.actions';
import { toast } from '../ui/use-toast';
import Image from 'next/image';

const SubscribeForm = () => {
    const [loading, setLoading] = useState(false)

    const FormSchema = z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
      });

      const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          email: '',
        },
      });

      const onSubmit = async (values: z.infer<typeof FormSchema>)=> {
        setLoading(true)
        const result = await subscribeToNewsletter(values.email);

        if(result === 'Failed to add email to newsletter')
        {
            toast({
                title: "Error",
                description: `${result}`, 
                variant: "destructive",
              })
        }else{
            toast({
                description: `${result}`, 
              })
        }
        setLoading(false)
        form.reset();
      }

  return (
        <div>
          <h3 className="font-semibold mb-2">Newsletter</h3>
          <p className="text-white mb-4">Subscribe to our newsletter for latest updates</p>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex text-black space-x-2 items-center'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='mail@example.com' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
            <div className='pt-8'>
            <Button className={` ${loading ? "bg-white" : "bg-black border border-white text-white"}`} variant={"ghost"} type="submit">
              
              {loading ?  (
              <Image
             src={"/assets/lineloader.svg"}
             alt={"loader"}
             width={30}
             height={30}
             className={`${loading ? "" : "hidden"} mx-auto`}
             />
             ) : "Subscribe"}
              
              </Button>
            </div>
            
          </form>
          </Form>
        </div>
  )
}

export default SubscribeForm
