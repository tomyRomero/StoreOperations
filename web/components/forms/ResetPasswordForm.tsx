"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleCheck } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import { newPassword } from "@/lib/validation/password";
import { FormAlert } from "./FormAlert";
import { PasswordChecklist, PasswordInput } from "./PasswordInput";

const FormSchema = z
  .object({
    newPassword: newPassword,
    confirmNewPassword: z.string().min(1, "Type the new password again"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "The two passwords don't match",
  });

// Sets a new password from the emailed link, which carries the account and a one-time token
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const userId = Number.parseInt(searchParams.get("user") ?? "", 10);
  const token = searchParams.get("token") ?? "";
  const [refusal, setRefusal] = useState<{ message: string; deadLink: boolean } | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });
  const typed = useWatch({ control: form.control, name: "newPassword" });
  const again = useWatch({ control: form.control, name: "confirmNewPassword" });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setRefusal(null);
    const { error, response } = await api.POST("/api/auth/reset-password", { body: { userId, token, newPassword: values.newPassword } });

    if (!response.ok) {
      const { newPassword: message } = fieldErrors(error);
      if (message) {
        form.setError("newPassword", { message }, { shouldFocus: true });
        return;
      }
      setRefusal({ message: problemMessage(error), deadLink: (error as ApiProblem | undefined)?.code === "INVALID_RESET_LINK" });
      return;
    }
    setDone(true);
  };

  if (!userId || !token) {
    return (
      <FormAlert>
        This link is incomplete. Copy the whole link from the email, or{" "}
        <Link href="/forgot-password" className="underline underline-offset-3">
          ask for a new one
        </Link>
        .
      </FormAlert>
    );
  }

  if (done) {
    return (
      <div role="status" className="grid justify-items-start gap-4 rounded-[28px] border bg-card p-7">
        <span className="grid size-12 place-items-center rounded-full bg-success-subtle text-success">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <h2 className="font-sans text-[26px] font-semibold tracking-[-0.03em]">Password changed</h2>
        <p className="text-muted-foreground">You&apos;ve been signed out everywhere. Sign in with your new password.</p>
        <Button asChild size="pill" className="mt-1 shadow-glow">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {refusal && (
        <FormAlert>
          {refusal.message}
          {refusal.deadLink && (
            <>
              {" "}
              <Link href="/forgot-password" className="underline underline-offset-3">
                Send me a new link
              </Link>
            </>
          )}
        </FormAlert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5.5" noValidate>
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <PasswordChecklist value={typed} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password, again</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <p role="status" className="text-[13px] text-success">
                  {again && again === typed && (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      Matches
                    </span>
                  )}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="pill" className="mt-1 w-full shadow-glow" loading={form.formState.isSubmitting}>
            Set new password
          </Button>
        </form>
      </Form>
    </div>
  );
}
