import Image from "next/image";
import { cn } from "@/lib/utils";

type MarkProps = {
  // The store's own logo from Theme and brand. Without one, a tile swept through the brand glows.
  logoUrl?: string | null;
  className?: string;
};

// The mark. Decorative, so screen readers skip it: the store's name is always beside it or named nearby.
export function LogoMark({ logoUrl, className }: MarkProps) {
  if (logoUrl) {
    return (
      <span aria-hidden className={cn("relative size-7 shrink-0 overflow-hidden rounded-[9px]", className)}>
        <Image src={logoUrl} alt="" fill sizes="32px" className="object-contain" />
      </span>
    );
  }
  return <span aria-hidden className={cn("size-7 shrink-0 rounded-[9px] bg-brand-sweep", className)} />;
}

type LogoProps = {
  name: string;
  logoUrl?: string | null;
  // The smaller size for phone headers
  compact?: boolean;
  className?: string;
};

// The mark and the store's name. The name is real text, so it reads as the store's name.
export function Logo({ name, logoUrl, compact = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", compact ? "gap-2" : "gap-2.5", className)}>
      <LogoMark logoUrl={logoUrl} className={cn(compact && "size-6 rounded-lg")} />
      <span className={cn("font-semibold tracking-[-0.02em]", compact ? "text-[17px]" : "text-[19px]")}>{name}</span>
    </span>
  );
}
