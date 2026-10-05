import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

// An order, product or customer that doesn't exist (or an old link to one), or a mistyped address
export default function AdminNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We couldn't find that"
      heading="h1"
      className="mt-10 bg-card"
      action={
        <Button asChild>
          <Link href="/admin">Back to the dashboard</Link>
        </Button>
      }
    >
      It may have been removed, or the link is wrong.
    </EmptyState>
  );
}
