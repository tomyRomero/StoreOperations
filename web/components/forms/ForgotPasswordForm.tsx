"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import { FormAlert } from "./FormAlert";

const FormSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address"),
});

// Asks for a reset link. The API answers the same whether or not the email has an account, so this
// says "if an account uses it" rather than confirming anything.
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/auth/forgot-password", { body: values });
    if (!response.ok) {
      setRefusal(problemMessage(error));
      return;
    }
    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div role="status" className="grid gap-4.5 rounded-[28px] border border-dashed border-foreground/16 p-7">
        <span className="grid size-12 place-items-center rounded-[14px] bg-accent-subtle text-accent-ink">
          <Mail className="size-6" strokeWidth={1.8} aria-hidden />
        </span>
        <h2 className="font-sans text-[30px] font-semibold leading-tight tracking-[-0.04em]">Check your email</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          If an account uses <span className="font-medium text-foreground">{sentTo}</span>, a reset link is on its way. It works once and expires in an
          hour.
        </p>
        <p className="text-sm text-faint">
          Nothing after a few minutes? Check spam, or{" "}
          <button type="button" onClick={() => setSentTo(null)} className="text-ink-2 underline underline-offset-3 hover:text-foreground">
            send it again
          </button>
          .
        </p>
      </div>
    );
  }

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
          <Button type="submit" size="pill" className="mt-1 w-full shadow-glow" loading={form.formState.isSubmitting}>
            Send reset link
          </Button>
        </form>
      </Form>
      <Link href="/sign-in" className="inline-flex items-center gap-1.5 justify-self-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}
