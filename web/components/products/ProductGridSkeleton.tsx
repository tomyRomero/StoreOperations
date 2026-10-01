import { Skeleton } from "@/components/ui/skeleton";

// The same grid and card shape as the real list, so nothing jumps when the products arrive
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-[28px] border bg-card">
          <Skeleton className="aspect-[5/6] w-full rounded-none" />
          <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-4">
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
            <Skeleton className="size-[42px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
