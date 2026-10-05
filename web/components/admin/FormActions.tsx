import { cn } from "@/lib/utils";

// A console form's buttons. While the form runs past the bottom of the screen they stay there, so saving
// never means scrolling back; at the end of the form they rest in place.
export function FormActions({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t bg-background py-4", className)}>{children}</div>;
}
