import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

// The address holds a one-time token, so it is never sent on to another site as the referrer
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">Choose a new password</h1>
        <p className="text-muted-foreground">Pick one you don&apos;t use anywhere else. Setting it signs you out everywhere.</p>
      </div>
      {/* The form reads the account and token from the link */}
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
