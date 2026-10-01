"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useCurrentUser } from "../CurrentUserProvider";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import { FormAlert } from "./FormAlert";

// The same limits as the API's ContactRequest
const FormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100, "Use at most 100 characters"),
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address").max(256),
  subject: z.string().trim().min(1, "Enter a subject").max(150, "Use at most 150 characters"),
  message: z.string().trim().min(10, "Write at least 10 characters").max(5000, "Use at most 5000 characters"),
});

type Values = z.infer<typeof FormSchema>;

const ContactForm = () => {
  const user = useCurrentUser();
  const [refusal, setRefusal] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    // A signed-in customer's email is already known
    defaultValues: { name: "", email: user?.email ?? "", subject: "", message: "" },
  });

  // The message goes to the store's support inbox with the customer's address as Reply-To. Nothing
  // is emailed to the address typed in, so the form can't be used to send mail to strangers.
  const onSubmit = async (values: Values) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/contact", { body: values });

    if (!response.ok) {
      // What they wrote stays in the form, so it isn't lost
      const errors = Object.entries(fieldErrors(error)).filter(([field]) => field in values);
      errors.forEach(([field, message], index) => form.setError(field as keyof Values, { message }, { shouldFocus: index === 0 }));
      if (errors.length === 0) setRefusal(problemMessage(error));
      return;
    }

    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div role="status" className="grid justify-items-center gap-3 py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-subtle">
          <CircleCheck className="size-6 text-success" aria-hidden />
        </span>
        <p className="font-display text-h3">Message sent</p>
        <p className="text-muted-foreground">Thanks for writing. We&apos;ll reply to {sentTo}.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            form.reset({ ...form.getValues(), subject: "", message: "" });
            setSentTo(null);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {refusal && <FormAlert>{refusal}</FormAlert>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
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
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="justify-self-start" loading={form.formState.isSubmitting}>
            Send message
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
