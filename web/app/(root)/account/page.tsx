import CustomerUserCard from "@/components/cards/CustomerUserCard"
import { requireUser } from "@/lib/session"

const page = async () => {

  const user = await requireUser("/account")

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 ">
    <CustomerUserCard username={user.username} email={user.email} />
    </section>
  )
}

export default page;
