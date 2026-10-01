import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AddAddressForm from "@/components/forms/AddAddressForm"

const Page = () => {
  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      <div className="flex items-center gap-4 pb-4">
        <Button asChild size="icon" variant="outline">
          <Link href="/account/myaddresses">
            <Image src={"/assets/back.png"} alt="" width={24} height={24} />
            <span className="sr-only">Back to your addresses</span>
          </Link>
        </Button>
        <h4>Back</h4>
      </div>
      <AddAddressForm />
    </section>
  )
}

export default Page;
