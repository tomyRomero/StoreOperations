"use client"

import React, { useState } from 'react'
import { CardTitle, CardDescription, CardHeader,CardFooter, Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Image from 'next/image'

const NewsletterForm = ({emails} : {emails: string[]}) => {

    const [loading, setLoading] = useState(false)

    const FormSchema = z.object({
        message: z
        .string()
        .min(1, 'Message is required')
        .min(20, 'Message must have than more 20 characters'), 
      });
    

      const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        message: ""
        },
      });

 // Function to send email for a single subscriber
const sendEmailToSubscriber = async (subscriberEmail: string, message: string) => {
    try {

        const nodeMailerData = {
            email: subscriberEmail,
            name: "",
            items: {},
            event: "newsletter",
            pricing: {},
            address: {}, 
            orderId: "",
            message: message
        }

      const currentURL = process.env.NEXT_PUBLIC_URL;
      const response = await axios.post(`${currentURL}/api/nodemailer`, nodeMailerData);
  
      if (response.status === 201) {
        console.log(`Email sent successfully to ${subscriberEmail}`);
        return { email: subscriberEmail, status: 'success' };
      } else {
        console.error(`Failed to send email to ${subscriberEmail}`);
        return { email: subscriberEmail, status: 'failed' };
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return { email: subscriberEmail, status: `error: ${error}` };
    }
  };

  // Function to send emails to all subscribers
const sendEmailsToSubscribers = async (subscribedEmails: string[], message: string) => {
    const emailStatuses = [];
  
    for (const email of subscribedEmails) {
      const status = await sendEmailToSubscriber(email, message);
      emailStatuses.push(status);
    }
  
    return emailStatuses;
  };

      const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        setLoading(true);
        const userConfirmed = window.confirm(`Are you ready to send out the newsletter? Clicking okay will send an email to all subscribed emails!`);

        if (userConfirmed) {
            try {
              const status = await sendEmailsToSubscribers(emails, values.message);
              console.log('Status of newsletter emails:', status);
        
              const statusMessages = status.map(({ email, status }) => `${email}: ${status}`);
              toast({
                title: "Newsletter Results",
                description: statusMessages.join('\n'), // Join individual status messages with newline
              });
            } catch (error) {
              console.error('Error sending newsletter emails:', error);
              toast({
                title: "Error",
                description: "Failed to send newsletter emails. Please try again later.",
                variant: "destructive"
              });
            }
          }

          setLoading(false)
      }

  return (
    <Card className="w-full max-w-lg mx-auto p-4">
    <CardHeader>
      <CardTitle className="text-heading3-bold">New message to all subscribed to newsletter</CardTitle>
      <CardDescription>Enter the details of your message below.</CardDescription>
    </CardHeader>
    
    <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
           encType="multipart/form-data"
           className='p-4'
          >
        <FormField
           control={form.control}
           name='message'
           render={({ field }) => (
        <FormItem className="space-y-2 pb-3">
          <FormLabel>Message</FormLabel>
          <FormControl>
             <Textarea placeholder="Enter Message for Newsletter Email" 
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
    <CardFooter>
      <div className="mx-auto">
      <Button className="bg-black text-white border border-black" variant={"ghost"}>
        Send message
      </Button>
      </div>
    </CardFooter>
    </form>
    </Form>
  </Card>
  )
}

export default NewsletterForm