import AdminUserCard from "@/components/cards/AdminUserCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/actions/admin.actions";
import ErrorMessage from "@/components/shared/Error";
import { getUserAddresses } from "@/lib/actions/store.actions";

const page = async ({ params }: { params: { id: string } })=> {

  const user = await getUser(params.id)

  if(!user)
  {
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
        <ErrorMessage />
      </section>
  }

  const addresses =  await getUserAddresses(params.id)

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