import Link from "next/link";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button";

interface Props{
  username: string;
  email: string;
}

const CustomerUserCard = ({ username, email }: Props) => {
  return (
    <Card>
    <CardHeader>
      <CardTitle>Account details</CardTitle>
      <CardDescription>
        Signed in as
        <span className="font-semibold"> {email}</span>
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Username</div>
          <div>{username}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Email</div>
          <div>{email}</div>
        </div>
      </div>
      <Separator />
      <Button asChild className="bg-black text-white border border-black" variant={"ghost"}>
        <Link href="/account/password">Change Password</Link>
      </Button>
    </CardContent>
  </Card>
  )
}

export default CustomerUserCard;
