"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  children?: React.ReactNode;
  // Renders the part of the page that failed again (an error boundary's reset)
  onRetry?: () => void;
  // Or any other way forward, such as a link that reloads the page
  action?: React.ReactNode;
  className?: string;
};

// Something failed: say so plainly and offer to try again. Details stay in the server's logs.
export function ErrorState({ title = "Something went wrong", children, onRetry, action, className }: Props) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-[24px] border bg-card px-6 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive-subtle">
        <TriangleAlert className="size-6 text-destructive" aria-hidden />
      </span>
      <h2 className="text-h3">{title}</h2>
      <p className="max-w-md text-muted-foreground">
        {children ?? "We couldn't load this. It's usually temporary, so please try again in a moment."}
      </p>
      {onRetry && (
        <Button className="mt-2" onClick={onRetry}>
          <RefreshCw aria-hidden />
          Try again
        </Button>
      )}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
