import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Checkout from "@/components/checkout/Checkout";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout: payment" };

// Pays for the bag, shipped to the address chosen in the step before (or the default address)
const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  await requireUser("/checkout");
  const addresses = await getAddresses();

  const chosen = Number(searchParams.address);
  const address = addresses?.find((a) => a.id === chosen) ?? addresses?.find((a) => a.isDefault);
  if (addresses && !address) redirect("/address");

  return (
    <div className="container max-w-[1240px] pb-20 pt-10 lg:pt-14">
      {address ? <Checkout address={address} /> : <ErrorState title="We couldn't load checkout" action={<RetryButton />} />}
    </div>
  );
};

export default Page;
