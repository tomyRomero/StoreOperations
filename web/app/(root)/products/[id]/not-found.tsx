import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { getStoreSettings } from "@/lib/data/catalog";
import { nounsOf } from "@/lib/storefront";

// An old link to a product the store no longer sells, or a mistyped address
export default async function ProductNotFound() {
  const { many } = nounsOf(await getStoreSettings());
  return (
    <div className="container py-16">
      <EmptyState
        icon={PackageX}
        title="We couldn't find that product"
        heading="h1"
        action={
          <Button asChild>
            <Link href="/products">Browse all {many}</Link>
          </Button>
        }
      >
        It may have sold out for good, or the link is wrong. Everything we sell today is in the shop.
      </EmptyState>
    </div>
  );
}
