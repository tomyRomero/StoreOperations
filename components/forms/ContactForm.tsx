"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios'
import { toast } from '../ui/use-toast'

const ContactForm = () => {
const [loading, setLoading] = useState(false)

const FormSchema = z
//Added strict password params to ensure safety from brute force attacks
  .object({
    firstname: z
    .string()
    .min(1, 'First Name Required'),
    lastname: z
    .string()
    .min(1, 'Last Name Required'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    subject: z
    .string()
    .min(1, 'Subject Required'),
    message: z
    .string()
    .min(10, 'Message Required and must be at least 10 characters long'),

  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true)
    try {
        const nodeMailerData = {
            email: values.email,
            name: `${values.firstname} ${values.lastname}`,
            items: {},
            event: "support",
            pricing: {},
            address: {}, 
            orderId: "",
            message: values.message
        }

      const currentURL = process.env.NEXT_PUBLIC_URL;
      const response = await axios.post(`${currentURL}/api/nodemailer`, nodeMailerData);

      if (response.status === 201) {
        toast({
            title: "Success",
            description: `Your message was delivered`,
          });
       
      } else {
        toast({
            title: "Failed to Send Email",
            description: `Something went wrong, please try again later, or email us directly using our contact information.`,
            variant:"destructive"
          });
       
      }
    }catch(error)
    {
        console.log(error)
        toast({
            title: "An Error Occured",
            description: `${error} , please try again later, or email us directly using our contact information.`,
            variant:"destructive"
          });
    }

    setLoading(false)
    form.reset();
  }


  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center justify-center space-y-4 text-center">
    <div className="space-y-2">
      <h2 className="text-heading3-bold tracking-tighter pt-4">Contact Us</h2>
      <p className="mx-auto text-gray-500 md:text-xl">
        Fill out the form below and we'll get back to you as soon as possible.
      </p>
    </div>

    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <FormField
                control={form.control}
                name='firstname'
                render={({ field }) => (
                <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                    <Input placeholder='Enter your first name' {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-2">
        <FormField
                control={form.control}
                name='lastname'
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                    <Input placeholder='Enter your last name' {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
      </div>
      <div className="space-y-2">
      <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder='Enter your email' {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
      </div>
      <div className="space-y-2">
        <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                    <Input placeholder='Enter your subject' {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
      </div>
      <div className="space-y-2">
      <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                    <Textarea placeholder='Enter your desired message' {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
      </div>
      <Image
             
              src={"/assets/spinner.svg"}
              alt={"loader"}
              width={100}
              height={100}
              className={`${loading ? "" : "hidden"} mx-auto`}
            />
      <div className="py-2">
      <Button
      className="bg-black text-white border border-black"
      variant={"ghost"}
      type='submit'
      >
      Submit
      </Button>
      </div>
      <br/>
    </div>
    </form>
    </Form>
  </div>
  )
}

export default ContactForm