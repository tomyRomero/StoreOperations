"use client";

import { useStoreBrand } from "@/components/StoreBrandProvider";
import { Logo } from "./Logo";

// This store's logo and name, from Theme and brand
export function StoreLogo({ compact, className }: { compact?: boolean; className?: string }) {
  const { name, logoUrl } = useStoreBrand();
  return <Logo name={name} logoUrl={logoUrl} compact={compact} className={className} />;
}
