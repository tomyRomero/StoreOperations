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
import { api } from '@/lib/api/browser';
import { fieldErrors, problemMessage } from '@/lib/api/problems';
import { newPassword } from '@/lib/validation/password';
import { useState } from 'react';
import Image from 'next/image';

const FormSchema = z
  .object({
    password: z.string().min(1, 'Enter your current password'),
    newPassword: newPassword,
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match',
  });

const ChangePasswordForm = () => {
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

  // Changing it signs out every other session; this one stays signed in
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true)
    const { error, response } = await api.POST('/api/auth/change-password', {
      body: { currentPassword: values.password, newPassword: values.newPassword },
    });

    if (!response.ok) {
      const errors = fieldErrors(error);
      if (errors.currentPassword) form.setError('password', { message: errors.currentPassword });
      if (errors.newPassword) form.setError('newPassword', { message: errors.newPassword });
      toast({
        title: "Couldn't change your password",
        description: problemMessage(error),
        variant: "destructive",
      })
      setLoading(false)
      return;
    }

    toast({ title: "Password changed", description: "You've been signed out everywhere else." })
    router.push('/account');
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
          <h1>Password must contain at least one capitalized letter, at least one number, at least one special character and be at least nine characters long</h1>
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


