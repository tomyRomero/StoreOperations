import { cn } from "@/lib/utils";

// The mark: a tile swept through the brand glows. Decorative, so screen readers skip it.
export function LogoMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn("size-7 shrink-0 rounded-[9px] bg-brand-sweep", className)} />;
}

type LogoProps = {
  name?: string;
  // The smaller size for phone headers
  compact?: boolean;
  className?: string;
};

// The mark and the store's name. The name is real text, so it reads as the store's name.
export function Logo({ name = "Palettehub", compact = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", compact ? "gap-2" : "gap-2.5", className)}>
      <LogoMark className={cn(compact && "size-6 rounded-lg")} />
      <span className={cn("font-semibold tracking-[-0.02em]", compact ? "text-[17px]" : "text-[19px]")}>{name}</span>
    </span>
  );
}
