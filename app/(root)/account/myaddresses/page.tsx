
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAddresses } from "@/lib/actions/store.actions";
import AddressCard from "@/components/cards/AddressCard";
import Link from "next/link";
import { Address } from "@/app/types/global";

const page = async () => {

  const session = await getServerSession(authOptions);
  let addresses:Address[] = [];
  let user = ""
  if(session)
  {
    addresses = await getUserAddresses(session.user.id)
    
    user = session.user.id

  }

  if(addresses.length === 0)
  {
    return(
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      <Card>
      <CardHeader>
        <CardTitle className="text-heading3-bold">Shipping Addresses</CardTitle>
        <CardDescription>Manage your shipping addresses for a seamless checkout experience</CardDescription>
      </CardHeader>
      <CardContent>
        No Addresses Have Been Added...
      </CardContent>
      <CardFooter>
      <Link href="/account/addaddress">
       <Button size="sm" 
       className="bg-black text-white border border-black" 
       variant={"ghost"}>
       Add new address
       </Button>
       </Link>
      </CardFooter>
    </Card>
    </section>
    )
  }

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
    <Card>
      <CardHeader>
        <CardTitle className="text-heading3-bold">Shipping Addresses</CardTitle>
        <CardDescription>Manage your shipping addresses for a seamless checkout experience</CardDescription>
      </CardHeader>
        <AddressCard user= {user} addresses={addresses}/>
        <CardFooter>
        <Link href="/account/addaddress">
       <Button size="sm" 
       className="bg-black text-white border border-black" 
       variant={"ghost"}>
       Add new address
       </Button>
       </Link>
     </CardFooter>
    </Card>
    </section>
  )
}

export default page;