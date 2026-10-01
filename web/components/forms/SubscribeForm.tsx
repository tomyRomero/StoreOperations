"use client"

import React, { useState } from 'react'
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { toast } from '../ui/use-toast';
import { api } from '@/lib/api/browser';
import { problemMessage } from '@/lib/api/problems';

const FormSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter an email address').max(256),
});

// The API answers the same way whether or not the address was already on the list, so this form
// can't be used to find out who subscribes. The address gets an email saying it's subscribed,
// with a link to leave.
const SubscribeForm = () => {
    const [loading, setLoading] = useState(false)

      const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          email: '',
        },
      });

      const onSubmit = async (values: z.infer<typeof FormSchema>)=> {
        setLoading(true)
        const { error, response } = await api.POST("/api/newsletter", { body: { email: values.email } });
        setLoading(false)

        if (!response.ok) {
          toast({ title: "Couldn't subscribe you", description: problemMessage(error), variant: "destructive" })
          return
        }
        toast({ title: "Thanks for subscribing!", description: "We've emailed you to confirm." })
        form.reset();
      }

  return (
        <div>
          <h3 className="font-semibold mb-2">Newsletter</h3>
          <p className="text-white mb-4">Subscribe to our newsletter for latest updates</p>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex text-black space-x-2 items-start' noValidate>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder='mail@example.com' {...field} />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
            <Button className={` ${loading ? "bg-white" : "bg-black border border-white text-white"}`} variant={"ghost"} type="submit" disabled={loading}>
              {loading ? (
                <Image src={"/assets/lineloader.svg"} alt="Subscribing" width={30} height={30} className="mx-auto" />
              ) : "Subscribe"}
            </Button>
          </form>
          </Form>
        </div>
  )
}

export default SubscribeForm
