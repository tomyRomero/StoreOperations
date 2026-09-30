import CustomerUserCard from "@/components/cards/CustomerUserCard"
import ErrorMessage from "@/components/shared/Error"
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUserProfile } from "@/lib/data/account"

const page = async () => {

  const user = await getCurrentUserProfile()

  if(!user)
  {
    return (
      <section className="md:pt-28 max-sm:pt-24 lg:pt-0 ">
        <ErrorMessage />
      </section>
    )
  }

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 ">
    <CustomerUserCard
    username={user.username}
    email={user.email} 
    id={user.id} 
    date={user.date}
    />
    </section>
  )
}

export default page;