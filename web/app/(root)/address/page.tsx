import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ChooseAddress from "@/components/checkout/ChooseAddress"
import { getAddresses } from "@/lib/data/account"
import { requireUser } from "@/lib/session"

const Page = async (props: { searchParams: Promise<{ address?: string }> }) => {
  const searchParams = await props.searchParams;
  await requireUser("/address")
  const addresses = await getAddresses()

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <div className="flex items-center gap-4 pb-4">
        <Button asChild size="icon" variant="outline">
          <Link href="/cart">
            <Image src={"/assets/back.png"} alt="" width={24} height={24} />
            <span className="sr-only">Back to cart</span>
          </Link>
        </Button>
        <h4>Back to Cart</h4>
      </div>
      {addresses === null ? (
        <p className="text-red-500 text-heading4-bold">Couldn&apos;t load your addresses. Please try again.</p>
      ) : (
        <ChooseAddress addresses={addresses} selectedId={Number(searchParams.address) || undefined} />
      )}
    </section>
  )
}

export default Page;
