import type { Metadata } from "next";
import { ChooseAddress } from "@/components/checkout/ChooseAddress";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout: shipping" };

// Shipping comes from Store settings, so it matches what payment will charge
const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  await requireUser("/address");
  const [addresses, settings] = await Promise.all([getAddresses(), getStoreSettings()]);

  return (
    <div className="container max-w-[1240px] pb-20 pt-10 lg:pt-14">
      {addresses === null ? (
        <ErrorState title="We couldn't load your addresses" action={<RetryButton />} />
      ) : (
        <ChooseAddress addresses={addresses} selectedId={Number(searchParams.address) || undefined} shipping={settings} />
      )}
    </div>
  );
};

export default Page;
