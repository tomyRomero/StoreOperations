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
import { problemMessage } from '@/lib/api/problems';
import { safeReturnPath } from '@/lib/sign-in-path';

const FormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // The API sets its session cookie on this site (through the /api pass-through), then the page
  // re-renders as the signed-in user
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const { error, response } = await api.POST('/api/auth/login', { body: values });

    if (!response.ok) {
      toast({
        title: "Couldn't sign you in",
        description: problemMessage(error),
        variant: "destructive",
      })
      return;
    }

    toast({ title: "Welcome back!" })
    router.replace(safeReturnPath(searchParams.get('callbackUrl')));
    router.refresh();
  };

  

  return (
    <div className='bg-white p-4 rounded-lg'>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-ful'>
        <div className='space-y-2'>
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
        </div>
        <Button 
        variant={"ghost"}
        className='w-full mt-6 bg-black text-white border border-black'
         type='submit'>
          Sign in
        </Button>
      </form>
      <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
        or
      </div>
      {/* <GithubSignInButton>Sign in with Github</GithubSignInButton> */}
      <Button
            type="button"
            onClick={() => router.push('/')}
            className="w-full mt-3 bg-black text-white border border-black"
            variant={"ghost"}
      >
        Home
      </Button>
      <p className='text-center text-sm text-gray-600 mt-3'>
        If you don&apos;t have an account, please&nbsp;
        <Link className='text-blue text-bold hover:underline' href='/sign-up'>
          Sign up
        </Link>
      </p>
    </Form>
    </div>
  );
};

export default SignInForm;