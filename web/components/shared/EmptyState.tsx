import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  // One sentence about what to do next
  children?: React.ReactNode;
  // Usually one primary button
  action?: React.ReactNode;
  className?: string;
};

// "Nothing here yet", always with a way forward
export function EmptyState({ icon: Icon, title, children, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      </span>
      <h2 className="text-h3">{title}</h2>
      {children && <p className="max-w-md text-muted-foreground">{children}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
