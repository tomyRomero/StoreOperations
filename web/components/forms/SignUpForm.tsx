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
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { api } from '@/lib/api/browser';
import { fieldErrors, problemMessage } from '@/lib/api/problems';
import { safeReturnPath } from '@/lib/sign-in-path';
import { newPassword } from '@/lib/validation/password';
import { useState } from 'react';
import Image from 'next/image';

const FormSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Use at least 3 characters')
      .max(32, 'Use at most 32 characters')
      .regex(/^[A-Za-z0-9._-]+$/, 'Use only letters, numbers, dots, dashes and underscores'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: newPassword,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Creating the account also signs in, so the new customer goes straight back to where they were.
  // Passwords are sent exactly as typed: the API hashes them and never needs them escaped.
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true)
    const { username, email, password } = values;
    const { error, response } = await api.POST('/api/auth/register', { body: { username, email, password } });

    if (!response.ok) {
      for (const [field, message] of Object.entries(fieldErrors(error))) {
        if (field === 'username' || field === 'email' || field === 'password')
          form.setError(field, { message });
      }
      toast({
        title: "Couldn't create your account",
        description: problemMessage(error),
        variant: "destructive",
      })
      setLoading(false)
      return;
    }

    toast({ title: "Welcome to Palettehub!", description: "Your account is ready." })
    router.replace(safeReturnPath(searchParams.get('callbackUrl')));
    router.refresh();
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
                <h1 className='text-gray-500 text-subtle-medium'>Password must contain at least one capitalized letter, at least one number, at least one special character and be at least nine characters long</h1>
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
        <Button 
        variant={"ghost"}
        className={`w-full mt-6 bg-black text-white border border-black ${loading ? "bg-white" : ""}`} 
        type='submit'>
          {!loading? (<h1>Sign Up</h1>) : (
          <Image 
            src="/assets/lineloader.svg"
            alt="loading image"
            width={24}
            height={24}
          />
          )}
        </Button>
      </form>
      <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
        or
      </div>
      <Button
            type="button"
            onClick={() => router.push('/')}
            className="w-full mt-3 bg-black text-white border border-black"
            variant={"ghost"}
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


