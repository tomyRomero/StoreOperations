"use client"

import React, { useState } from 'react'
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
import { toast } from '../ui/use-toast'
import { api } from '@/lib/api/browser'
import { fieldErrors, problemMessage } from '@/lib/api/problems'

const ContactForm = () => {
const [loading, setLoading] = useState(false)

const FormSchema = z
  .object({
    firstname: z.string().trim().min(1, 'Enter your first name').max(50, 'Use at most 50 characters'),
    lastname: z.string().trim().min(1, 'Enter your last name').max(49, 'Use at most 49 characters'),
    email: z.string().trim().min(1, 'Enter your email').email('Enter an email address').max(256),
    subject: z.string().trim().min(1, 'Enter a subject').max(150, 'Use at most 150 characters'),
    message: z.string().trim().min(10, 'Write at least 10 characters').max(5000, 'Use at most 5000 characters'),
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

  // The message goes to the store's support inbox with the customer's address as Reply-To. Nothing
  // is emailed to the address typed in, so the form can't be used to send mail to strangers.
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true)
    const { error, response } = await api.POST('/api/contact', {
      body: { name: `${values.firstname} ${values.lastname}`, email: values.email, subject: values.subject, message: values.message },
    })
    setLoading(false)

    if (!response.ok) {
      for (const [field, message] of Object.entries(fieldErrors(error))) {
        if (field === 'email' || field === 'subject' || field === 'message') form.setError(field, { message })
      }
      // What they wrote stays in the form, so it isn't lost
      toast({ title: "Couldn't send your message", description: problemMessage(error), variant: "destructive" })
      return
    }

    toast({ title: "Message sent", description: `We'll reply to ${values.email}.` })
    form.reset();
  }


  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center justify-center space-y-4 text-center">
    <div className="space-y-2">
      <h2 className="text-heading3-bold tracking-tighter pt-4">Contact Us</h2>
      <p className="mx-auto text-gray-500 md:text-xl">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
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
      <div className="py-2">
      <Button
      className="bg-black text-white border border-black"
      variant={"ghost"}
      type='submit'
      disabled={loading}
      >
      {loading ? "Sending..." : "Send message"}
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