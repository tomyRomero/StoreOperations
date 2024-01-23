import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {

    // You can add any UI inside Loading,a Skeleton.
    return (
        <div>
        <h1 className="text-heading1-semibold text-black">Loading Login/Signup.....</h1>
        <div className="mt-5 flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        </div>
      )
  }