import AdminUserCard from "@/components/cards/AdminUserCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getAddressesForUser, getUserForAdmin } from "@/lib/data/admin";
import ErrorMessage from "@/components/shared/Error";

const page = async ({ params }: { params: { id: string } })=> {

  const user = await getUserForAdmin(params.id)

  if(!user)
  {
    return (
      <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
        <ErrorMessage />
      </section>
    )
  }

  const addresses =  await getAddressesForUser(params.id)

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      <AdminUserCard
       username={user.username}
       email={user.email} 
       id={user.id} 
       date={user.date}
       addresses={addresses}
       admin= {user.admin}
       />
      </section>
  )
}

export default page;