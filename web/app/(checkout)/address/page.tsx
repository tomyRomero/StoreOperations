import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChooseAddress } from "@/components/checkout/ChooseAddress";
import { GuestDetails } from "@/components/checkout/GuestDetails";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAddresses } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";
import { signInPath } from "@/lib/sign-in-path";

export const metadata: Metadata = { title: "Checkout: shipping" };

// Shipping comes from Store settings, so it matches what payment will charge. A guest gives their email
// and address here, unless the store asks for an account.
const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  const [user, settings] = await Promise.all([getCurrentUser(), getStoreSettings()]);

  if (!user) {
    if (settings && !settings.guestCheckout) redirect(signInPath("/address"));
    return (
      <div className="container max-w-[1240px] pb-20 pt-10 lg:pt-14">
        {settings ? <GuestDetails shipping={settings} /> : <ErrorState title="We couldn't load checkout" action={<RetryButton />} />}
      </div>
    );
  }

  const addresses = await getAddresses();
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
