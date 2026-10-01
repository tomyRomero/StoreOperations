import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { AddressBook } from "@/components/account/AddressBook";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Button } from "@/components/ui/button";
import { getAddresses } from "@/lib/data/account";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-h1">Addresses</h1>
          <p className="text-muted-foreground">Where we ship. The default is picked for you at checkout.</p>
        </div>
        {addresses && addresses.length > 0 && (
          <Button asChild variant="outline">
            <Link href="/account/addaddress">
              <Plus aria-hidden />
              Add an address
            </Link>
          </Button>
        )}
      </div>

      {addresses === null ? (
        <ErrorState
          title="We couldn't load your addresses"
          action={<RetryButton />}
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          action={
            <Button asChild>
              <Link href="/account/addaddress">Add an address</Link>
            </Button>
          }
        >
          Save one now and checkout skips straight to payment.
        </EmptyState>
      ) : (
        <AddressBook addresses={addresses} />
      )}
    </div>
  );
}
