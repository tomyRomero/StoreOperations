import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChooseAddress from "@/components/checkout/ChooseAddress";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout: shipping" };

const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  await requireUser("/address");
  const addresses = await getAddresses();

  return (
    <div className="container max-w-3xl py-8 lg:py-12">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Back to bag
      </Link>
      <h1 className="mt-4 text-h1">Checkout</h1>
      <div className="mt-6 mb-10">
        <CheckoutSteps current="shipping" />
      </div>
      {addresses === null ? (
        <ErrorState
          title="We couldn't load your addresses"
          action={<RetryButton />}
        />
      ) : (
        <ChooseAddress addresses={addresses} selectedId={Number(searchParams.address) || undefined} />
      )}
    </div>
  );
};

export default Page;
