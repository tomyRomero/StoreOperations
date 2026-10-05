import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Admins can browse the store like a customer; this slim bar says so and leads back
export function AdminBar() {
  return (
    <div className="bg-primary text-sm text-primary-foreground">
      <div className="container flex h-9 items-center justify-between gap-4">
        <p className="truncate">
          <span className="font-semibold">Admin view.</span>
          <span className="max-sm:hidden"> You&apos;re seeing the store as customers do.</span>
        </p>
        <Link href="/admin" className="inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline">
          Back to dashboard
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
