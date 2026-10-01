"use client";

import { usePathname } from "next/navigation";
import SubscribeForm from "@/components/forms/SubscribeForm";

// The footer's newsletter form, everywhere but the home page, which has its own band just above
export function FooterNewsletter() {
  return usePathname() === "/" ? null : <SubscribeForm />;
}
