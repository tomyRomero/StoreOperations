import Link from "next/link";
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AddressCard from "@/components/cards/AddressCard";
import { getAddresses } from "@/lib/data/account";

const page = async () => {

  const addresses = await getAddresses()

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
    <Card>
      <CardHeader>
        <CardTitle className="text-heading3-bold">Shipping Addresses</CardTitle>
        <CardDescription>Manage your shipping addresses for a seamless checkout experience</CardDescription>
      </CardHeader>
      {addresses === null ? (
        <CardContent className="text-red-500">Couldn&apos;t load your addresses. Please try again later.</CardContent>
      ) : addresses.length === 0 ? (
        <CardContent>No addresses have been added yet.</CardContent>
      ) : (
        <AddressCard addresses={addresses} />
      )}
      <CardFooter>
        <Button asChild size="sm" className="bg-black text-white border border-black" variant={"ghost"}>
          <Link href="/account/addaddress">Add new address</Link>
        </Button>
      </CardFooter>
    </Card>
    </section>
  )
}

export default page;
