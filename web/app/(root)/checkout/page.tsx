import { redirect } from 'next/navigation';
import Checkout from '@/components/checkout/Checkout';
import { getAddresses } from '@/lib/data/account';
import { requireUser } from '@/lib/session';

// Pays for the cart, shipped to the address chosen in the step before (or the default address)
const Page = async ({ searchParams }: { searchParams: { address?: string } }) => {
  await requireUser("/checkout");
  const addresses = await getAddresses();

  const chosen = Number(searchParams.address);
  const address = addresses?.find((a) => a.id === chosen) ?? addresses?.find((a) => a.isDefault);
  if (addresses && !address) redirect("/address");

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      {address ? (
        <Checkout address={address} />
      ) : (
        <h1 className="text-red-500 text-heading3-bold text-center">Failed to load checkout. Please try again.</h1>
      )}
    </section>
  );
}

export default Page
