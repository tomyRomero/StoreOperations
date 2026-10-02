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
import { useStoreBrand } from "@/components/StoreBrandProvider";
import { problemMessage } from "@/lib/api/problems";

const FormSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address").max(256),
});

type Props = {
  // The footer's compact form under its own heading, or the home page's band, which brings its own heading
  variant?: "footer" | "band";
};

// The API answers the same way whether or not the address was already on the list, so this form
// can't be used to find out who subscribes. The address gets an email saying it's subscribed,
// with a link to leave.
const SubscribeForm = ({ variant = "footer" }: Props) => {
  const { many } = useStoreBrand();
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

  const body = subscribed ? (
    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success">
      <CircleCheck className="size-4" aria-hidden />
      You&apos;re subscribed. Check your inbox.
    </p>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={variant === "footer" ? "flex items-start gap-2" : undefined} noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) =>
            variant === "band" ? (
              // On larger screens the field and the button share one pill, whose border marks the field
              <FormItem>
                <FormLabel className="sr-only">Email address</FormLabel>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-2 sm:rounded-full sm:border sm:border-input sm:bg-foreground/5 sm:p-1.5">
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-13 rounded-[14px] px-4 sm:h-[50px] sm:flex-1 sm:rounded-full sm:border-transparent sm:bg-transparent sm:px-4.5"
                      {...field}
                    />
                  </FormControl>
                  <Button type="submit" loading={form.formState.isSubmitting} className="h-13 rounded-full px-6 text-[15px] sm:h-[50px]">
                    Sign up
                  </Button>
                </div>
                <FormMessage className="sm:px-5" />
              </FormItem>
            ) : (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-full px-4" {...field} />
                </FormControl>
                <FormMessage className="px-4" />
              </FormItem>
            )
          }
        />
        {variant === "footer" && (
          <Button type="submit" loading={form.formState.isSubmitting} className="h-11 rounded-full px-5">
            Subscribe
          </Button>
        )}
      </form>
    </Form>
  );

  if (variant === "band") return body;

  return (
    <section aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading" className="mb-1.5 font-sans text-[15px] font-semibold">
        Newsletter
      </h2>
      <p className="mb-4 text-[15px] text-muted-foreground">New {many} and deals, about once a month. Leave any time.</p>
      {body}
    </section>
  );
};

export default SubscribeForm;
