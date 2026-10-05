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

export function SignInForm({ storeName }: { storeName: string }) {
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5.5" noValidate>
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
                <div className="flex items-baseline justify-between gap-3">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" className="text-[13px] font-medium text-accent underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="pill" className="mt-1 w-full shadow-glow" loading={form.formState.isSubmitting}>
            Sign in
          </Button>
        </form>
      </Form>
      <div className="grid gap-4 border-t border-foreground/8 pt-5 text-center">
        <p className="text-[15px] text-muted-foreground">
          New to {storeName}?{" "}
          <Link href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
        {/* The bag merges into the account on signing in (CartProvider), so nothing in it is lost */}
        <p className="text-[13px] text-faint">
          Or{" "}
          <Link href="/products" className="text-ink-2 underline underline-offset-3 hover:text-foreground">
            keep browsing
          </Link>
          , your bag stays put.
        </p>
      </div>
    </div>
  );
}
