"use client";

import { usePathname } from "next/navigation";
import { SubscribeForm } from "@/components/forms/SubscribeForm";

// The footer's newsletter form, everywhere but a home page that has its own band just above
export function FooterNewsletter({ homeHasBand }: { homeHasBand: boolean }) {
  const onHome = usePathname() === "/";
  return homeHasBand && onHome ? null : <SubscribeForm />;
}
