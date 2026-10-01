import { Skeleton } from "@/components/ui/skeleton";

// Between account pages the menu stays and only this part waits
export default function AccountLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-48" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  );
}
