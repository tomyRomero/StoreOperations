import { cn } from "@/lib/utils";

// A placeholder shaped like the content it stands in for. A gentle pulse, no shimmer.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
