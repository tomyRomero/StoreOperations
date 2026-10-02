"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import { FormAlert } from "./FormAlert";

const FormSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address"),
  orderNumber: z.string().trim().min(1, "Enter the order number").max(20, "Use at most 20 characters"),
});

type Values = z.infer<typeof FormSchema>;

// Asks for the link to an order. The API emails it only to the address the order was placed with, and
// answers the same either way, so this says "if" rather than confirming anything.
export function FindOrderForm() {
  const [sent, setSent] = useState<Values | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", orderNumber: "" },
  });

  const onSubmit = async (values: Values) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/orders/find", { body: values });
    if (!response.ok) {
      setRefusal(problemMessage(error));
      return;
    }
    setSent(values);
  };

  if (sent) {
    return (
      <div role="status" className="grid gap-4.5 rounded-[28px] border border-dashed border-foreground/16 p-7">
        <span className="grid size-12 place-items-center rounded-[14px] bg-accent-subtle text-accent-ink">
          <Mail className="size-6" strokeWidth={1.8} aria-hidden />
        </span>
        <h2 className="font-sans text-[30px] font-semibold leading-tight tracking-[-0.04em]">Check your email</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          If order <span className="font-mono font-medium text-foreground">{sent.orderNumber.replace(/^#/, "")}</span> was placed with{" "}
          <span className="font-medium text-foreground">{sent.email}</span>, a link to it is on its way.
        </p>
        <p className="text-sm text-faint">
          Nothing after a few minutes? Check spam, or{" "}
          <button type="button" onClick={() => setSent(null)} className="text-ink-2 underline underline-offset-3 hover:text-foreground">
            try again
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
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order number</FormLabel>
                <FormControl>
                  <Input autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="7K3M9Q2A" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="pill" className="mt-1 w-full shadow-glow" loading={form.formState.isSubmitting}>
            Email me the link
          </Button>
        </form>
      </Form>
    </div>
  );
}
