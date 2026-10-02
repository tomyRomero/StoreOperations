"use client";

import { useForm, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import { newPassword } from "@/lib/validation/password";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { PasswordChecklist, PasswordInput } from "./PasswordInput";

const FormSchema = z
  .object({
    password: z.string().min(1, "Enter your current password"),
    newPassword: newPassword,
    confirmNewPassword: z.string().min(1, "Type the new password again"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "The two new passwords don't match",
  });

// Changing it signs out every other session; this one stays signed in
const ChangePasswordForm = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "", newPassword: "", confirmNewPassword: "" },
  });
  const typed = useWatch({ control: form.control, name: "newPassword" });
  const user = useCurrentUser();
  const again = useWatch({ control: form.control, name: "confirmNewPassword" });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const { error, response } = await api.POST("/api/auth/change-password", {
      body: { currentPassword: values.password, newPassword: values.newPassword },
    });

    if (!response.ok) {
      const errors = fieldErrors(error);
      if (errors.currentPassword) form.setError("password", { message: errors.currentPassword }, { shouldFocus: true });
      if (errors.newPassword) form.setError("newPassword", { message: errors.newPassword });
      toast({ title: "Couldn't change your password", description: problemMessage(error), variant: "destructive" });
      return;
    }

    toast({ variant: "success", title: "Password changed", description: "You've been signed out everywhere else." });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5.5" noValidate>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <PasswordChecklist value={typed} personal={user ? [user.username, user.email] : []} />
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
              {/* Says so as soon as the two agree, so nobody has to submit to find out */}
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
          Update password
        </Button>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
