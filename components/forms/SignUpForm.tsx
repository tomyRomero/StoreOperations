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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';

const FormSchema = z
//Added strict password params to ensure safety from brute force attacks
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(9, 'Password must be at least 9 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one capitalized letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .refine((value) => !/\s/.test(value), 'Password cannot contain whitespace'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

// Function to encode HTML entities
const encodeHTML = (str: string) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const SignUpForm = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {

  try{
   const response = await fetch('/api/user', {
    method: 'POST', 
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      // Encode the username before sending it to the server fro added security to prevent XSS attacks.
      username: encodeHTML(values.username), 
      email: encodeHTML(values.email), 
      password: encodeHTML(values.password), 
    })
   })

   const responseData = await response.json();

   if(response.ok) {
    toast({
      title: "Success! Account Created",
      description: "Redirecting to Login Page", 
    })
    
    // Introduce a delay before redirecting so user has time to read message
    setTimeout(() => {
      router.push('/sign-in');
    }, 2000);
      
   }else{
    toast({
      title: "Error Creating Account",
      description: `Something went wrong! ${responseData.message}`, 
      variant: "destructive",
    })
   }
  }catch(error)
  {
    console.error('Error during fetch:', error);
    alert(`An unexpected error occurred. ${error}`);
  }
  };

  return (
    <div className='bg-white p-4 rounded-lg'>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='johndoe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='mail@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Re-Enter your password</FormLabel>
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
        <Button className='w-full mt-6' type='submit'>
          Sign up
        </Button>
      </form>
      <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
        or
      </div>
      <Button
            type="button"
            onClick={() => router.push('/')}
            className="w-full mt-3"
      >
        Home
      </Button>
      <p className='text-center text-sm text-gray-600 mt-2'>
        If you don&apos;t have an account, please&nbsp;
        <Link className='text-blue hover:underline' href='/sign-in'>
          Sign in
        </Link>
      </p>
    </Form>
    </div>
  );
};

export default SignUpForm;


