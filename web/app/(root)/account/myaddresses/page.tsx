import type { Metadata } from "next";
import { AddressBook } from "@/components/account/AddressBook";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">Addresses</h1>
        <p className="text-muted-foreground">Where we ship. The default is picked for you at checkout.</p>
      </div>
      {addresses === null ? <ErrorState title="We couldn't load your addresses" action={<RetryButton />} /> : <AddressBook addresses={addresses} />}
    </div>
  );
}
