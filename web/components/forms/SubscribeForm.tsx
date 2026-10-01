"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";

const FormSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address").max(256),
});

// The API answers the same way whether or not the address was already on the list, so this form
// can't be used to find out who subscribes. The address gets an email saying it's subscribed,
// with a link to leave.
const SubscribeForm = () => {
  const [subscribed, setSubscribed] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const { error, response } = await api.POST("/api/newsletter", { body: { email: values.email } });

    if (!response.ok) {
      toast({ title: "Couldn't subscribe you", description: problemMessage(error), variant: "destructive" });
      return;
    }
    toast({ variant: "success", title: "Thanks for subscribing!", description: "We've emailed you to confirm." });
    setSubscribed(true);
    form.reset();
  };

  return (
    <section aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading" className="mb-2 font-sans text-sm font-semibold">
        Newsletter
      </h2>
      <p className="mb-4 text-sm text-white/75">New supplies and deals, about once a month. Leave any time.</p>
      {subscribed ? (
        <p role="status" className="flex items-center gap-2 text-sm font-semibold">
          <CircleCheck className="size-4" aria-hidden />
          You&apos;re subscribed. Check your inbox.
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage className="text-white" />
                </FormItem>
              )}
            />
            <Button type="submit" variant="secondary" loading={form.formState.isSubmitting} className="bg-white hover:bg-white/90">
              Subscribe
            </Button>
          </form>
        </Form>
      )}
    </section>
  );
};

export default SubscribeForm;
