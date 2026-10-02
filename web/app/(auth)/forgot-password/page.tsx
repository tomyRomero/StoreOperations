import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">Forgot your password?</h1>
        <p className="text-muted-foreground">Enter the email on your account and we&apos;ll send a link to choose a new one.</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
