'use client';

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
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { useState } from 'react';
import Image from 'next/image';

const FormSchema = z
//Added strict password params to ensure safety from brute force attacks
  .object({
    password: z
    .string()
    .min(9, 'Password must be at least 9 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one capitalized letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .refine((value) => !/\s/.test(value), 'Password cannot contain whitespace'),
    newPassword: z
      .string()
      .min(9, 'Password must be at least 9 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one capitalized letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .refine((value) => !/\s/.test(value), 'Password cannot contain whitespace'),
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

// Function to encode HTML entities
const encodeHTML = (str: string) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const ChangePasswordForm = ({userId} : {userId: string}) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
  setLoading(true)
  try{
   const response = await fetch('/api/changepassword', {
    method: 'POST', 
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      // Encode the username before sending it to the server fro added security to prevent XSS attacks.
      id: encodeHTML(userId).toString(),
      password: encodeHTML(values.password), 
      newPassword: encodeHTML(values.newPassword)
    })
   })

   const responseData = await response.json();

   if(response.ok) {
    toast({
      title: "Success! Password Changed",
      description: "Redirecting to Account Page", 
    })
    
    // Introduce a delay before redirecting so user has time to read message
    setTimeout(() => {
      router.push('/account');
    }, 2000);
      
   }else{
    toast({
      title: "Error Changing Password",
      description: `Something went wrong! ${responseData.message}`, 
      variant: "destructive",
    })
    setLoading(false)
   }
  }catch(error)
  {
    console.error('Error during fetch:', error);
    toast({
      title: "Error Changing Password",
      description: `Something went wrong! ${error}`, 
      variant: "destructive",
    })
    setLoading(false)
  }

  
  };

  return (
    <div className='bg-white p-4 rounded-lg max-w-2xl mx-auto'>
        <Button 
        className="flex px-6 border border-black" 
        variant="ghost" 
        onClick={()=> {
          router.push("/account")
        }}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Go Back</span>
        </Button>
        <br></br>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your old password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Enter your New Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Re-Enter your password'
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmNewPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Re-Enter your New Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Re-Enter your password'
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
     
        <div className="flex justify-center">
            <Button className={`w-3/4 mt-6 ${loading ? 'border border-black bg-white' : ''}`} type="submit">
              {!loading ? (
                <h1>Change Password</h1>
              ) : (
                <Image src="/assets/lineloader.svg" alt="loading image" width={24} height={24} />
              )}
            </Button>
          </div>
      </form>
    </Form>
    </div>
  );
};

export default ChangePasswordForm;


