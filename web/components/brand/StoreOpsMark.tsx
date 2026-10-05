import { cn } from "@/lib/utils";

// The StoreOps mark for the console. Decorative: the name is always beside it.
export function StoreOpsMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-[7px] bg-linear-135 from-[#2f5bff] to-[#7b4dff]", className)}>
      <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
        <path d="M7 8.5h10M7 12h6M7 15.5h10" />
      </svg>
    </span>
  );
}
