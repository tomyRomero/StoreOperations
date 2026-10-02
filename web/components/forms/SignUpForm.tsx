"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useStoreBrand } from "@/components/StoreBrandProvider";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import { safeReturnPath } from "@/lib/sign-in-path";
import { newPassword } from "@/lib/validation/password";
import { FormAlert } from "./FormAlert";
import { PasswordChecklist, PasswordInput } from "./PasswordInput";

const FormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(32, "Use at most 32 characters")
    .regex(/^[A-Za-z0-9._-]+$/, "Use only letters, numbers, dots, dashes and underscores"),
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address"),
  password: newPassword,
  subscribeToNewsletter: z.boolean(),
});

const SignUpForm = ({ storeName }: { storeName: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { many } = useStoreBrand();
  const [refusal, setRefusal] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: "", email: "", password: "", subscribeToNewsletter: false },
  });
  const [typed, username, email] = useWatch({ control: form.control, name: ["password", "username", "email"] });

  // Creating the account also signs in, so the new customer goes straight back to where they were.
  // Passwords are sent exactly as typed: the API hashes them and never needs them escaped.
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/auth/register", { body: values });

    if (!response.ok) {
      const errors = Object.entries(fieldErrors(error)).filter(([field]) => field === "username" || field === "email" || field === "password");
      errors.forEach(([field, message], index) => form.setError(field as keyof typeof values, { message }, { shouldFocus: index === 0 }));
      if (errors.length === 0) setRefusal(problemMessage(error));
      return;
    }

    toast({ variant: "success", title: `Welcome to ${storeName}!`, description: "Your account is ready." });
    router.replace(safeReturnPath(callbackUrl));
    router.refresh();
  };

  return (
    <div className="grid gap-6">
      {refusal && <FormAlert>{refusal}</FormAlert>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5.5" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" {...field} />
                </FormControl>
                <FormDescription>Letters, numbers, dots, dashes and underscores.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <PasswordChecklist value={typed} personal={[username, email]} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subscribeToNewsletter"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="mt-0.5 size-5 shrink-0 cursor-pointer accent-(--accent)"
                  />
                </FormControl>
                <div className="grid gap-0.5">
                  <FormLabel className="cursor-pointer font-normal">Email me about new {many} and sales</FormLabel>
                  <FormDescription className="text-[13px]">About once a month. Unsubscribe in one click.</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" size="pill" className="mt-1 w-full shadow-glow" loading={form.formState.isSubmitting}>
            Create account
          </Button>
        </form>
      </Form>
      <p className="border-t border-foreground/8 pt-5 text-center text-[15px] text-muted-foreground">
        Already have one?{" "}
        <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"} className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
