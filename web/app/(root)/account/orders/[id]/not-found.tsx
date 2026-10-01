import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function OrderNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We couldn't find that order"
      action={
        <Button asChild>
          <Link href="/account/orders">See your orders</Link>
        </Button>
      }
    >
      Check the order number in your confirmation email, or pick it from your orders.
    </EmptyState>
  );
}
