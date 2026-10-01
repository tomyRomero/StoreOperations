import { CircleAlert } from "lucide-react";

// Why a form was refused, above the form and read out as soon as it appears
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive-subtle p-3 text-sm font-medium">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      {children}
    </p>
  );
}
