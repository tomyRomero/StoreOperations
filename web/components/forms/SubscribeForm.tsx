"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { useStoreBrand } from "@/components/StoreBrandProvider";
import { problemMessage } from "@/lib/api/problems";

type Props = {
  // The footer's compact form under its own heading, or the home page's band, which brings its own heading
  variant?: "footer" | "band";
};

// One field, so it's checked by hand: the form libraries the other forms use would add about 30 KB to
// every page, since the footer is on every page. The API checks the address again.
function emailProblem(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email";
  if (email.length > 256 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter an email address";
  return null;
}

// The API answers the same way whether or not the address was already on the list, so this form
// can't be used to find out who subscribes. The address gets an email saying it's subscribed,
// with a link to leave.
const SubscribeForm = ({ variant = "footer" }: Props) => {
  const { many } = useStoreBrand();
  const id = useId();
  const field = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = emailProblem(email);
    setProblem(found);
    if (found) {
      field.current?.focus();
      return;
    }

    setSending(true);
    const { error, response } = await api.POST("/api/newsletter", { body: { email: email.trim() } });
    setSending(false);

    if (!response.ok) {
      toast({ title: "Couldn't subscribe you", description: problemMessage(error), variant: "destructive" });
      return;
    }
    toast({ variant: "success", title: "Thanks for subscribing!", description: "We've emailed you to confirm." });
    setSubscribed(true);
    setEmail("");
  };

  const inputId = `${id}-email`;
  const messageId = `${id}-message`;
  const input = (className: string) => (
    <Input
      ref={field}
      id={inputId}
      type="email"
      autoComplete="email"
      placeholder="you@example.com"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      aria-invalid={problem ? true : undefined}
      aria-describedby={problem ? messageId : undefined}
      className={className}
    />
  );
  const message = (className: string) =>
    problem && (
      <p id={messageId} className={`text-sm font-medium text-destructive ${className}`}>
        {problem}
      </p>
    );

  const body = subscribed ? (
    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success">
      <CircleCheck className="size-4" aria-hidden />
      You&apos;re subscribed. Check your inbox.
    </p>
  ) : variant === "band" ? (
    <form onSubmit={onSubmit} noValidate className="grid gap-2">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      {/* On larger screens the field and the button share one pill, whose border marks the field */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-2 sm:rounded-full sm:border sm:border-input sm:bg-foreground/5 sm:p-1.5">
        {input("h-13 rounded-[14px] px-4 sm:h-[50px] sm:flex-1 sm:rounded-full sm:border-transparent sm:bg-transparent sm:px-4.5")}
        <Button type="submit" loading={sending} className="h-13 rounded-full px-6 text-[15px] sm:h-[50px]">
          Sign up
        </Button>
      </div>
      {message("sm:px-5")}
    </form>
  ) : (
    <form onSubmit={onSubmit} noValidate className="flex items-start gap-2">
      <div className="grid flex-1 gap-2">
        <label htmlFor={inputId} className="sr-only">
          Email
        </label>
        {input("h-11 rounded-full px-4")}
        {message("px-4")}
      </div>
      <Button type="submit" loading={sending} className="h-11 rounded-full px-5">
        Subscribe
      </Button>
    </form>
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
