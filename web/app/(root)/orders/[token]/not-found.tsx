import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function GuestOrderNotFound() {
  return (
    <div className="container py-12 lg:py-20">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that order"
        heading="h1"
        action={
          <Button asChild>
            <Link href="/orders/find">Find your order</Link>
          </Button>
        }
      >
        The link may be cut short. Open it again from your confirmation email, or have it sent to you again.
      </EmptyState>
    </div>
  );
}
