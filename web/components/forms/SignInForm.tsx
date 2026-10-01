"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import { safeReturnPath } from "@/lib/sign-in-path";
import { FormAlert } from "./FormAlert";
import { PasswordInput } from "./PasswordInput";

const FormSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address"),
  password: z.string().min(1, "Enter your password"),
});

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [refusal, setRefusal] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  // The API sets its session cookie on this site (through the /api pass-through), then the page
  // re-renders as the signed-in user. A wrong email or password gets one message, so the form
  // doesn't tell anyone which accounts exist.
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/auth/login", { body: values });

    if (!response.ok) {
      setRefusal(problemMessage(error));
      return;
    }

    toast({ variant: "success", title: "Welcome back!" });
    router.replace(safeReturnPath(callbackUrl));
    router.refresh();
  };

  return (
    <div className="grid gap-6">
      {refusal && <FormAlert>{refusal}</FormAlert>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" loading={form.formState.isSubmitting}>
            Sign in
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default SignInForm;
