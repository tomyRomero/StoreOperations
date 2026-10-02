import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";

export const metadata: Metadata = { title: "Password" };

export default function PasswordPage() {
  return (
    <div className="grid max-w-[620px] gap-6">
      <div className="grid gap-2">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">Password</h1>
        <p className="text-muted-foreground">Changing it signs you out everywhere else.</p>
      </div>
      <section aria-label="Change your password" className="rounded-[28px] border bg-card p-6 sm:p-7">
        <ChangePasswordForm />
      </section>
    </div>
  );
}
