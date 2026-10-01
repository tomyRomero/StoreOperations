import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Checkout from "@/components/checkout/Checkout";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout: payment" };

// Pays for the cart, shipped to the address chosen in the step before (or the default address)
const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  await requireUser("/checkout");
  const addresses = await getAddresses();

  const chosen = Number(searchParams.address);
  const address = addresses?.find((a) => a.id === chosen) ?? addresses?.find((a) => a.isDefault);
  if (addresses && !address) redirect("/address");

  return (
    <div className="container max-w-5xl py-8 lg:py-12">
      <Link
        href={address ? `/address?address=${address.id}` : "/address"}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to shipping
      </Link>
      <h1 className="mt-4 text-h1">Checkout</h1>
      <div className="mt-6 mb-10">
        <CheckoutSteps current="payment" />
      </div>
      {address ? (
        <Checkout address={address} />
      ) : (
        <ErrorState
          title="We couldn't load checkout"
          action={<RetryButton />}
        />
      )}
    </div>
  );
};

export default Page;
