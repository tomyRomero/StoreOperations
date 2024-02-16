"use client"

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props{
  username: string;
  id: string;
  email: string;
  date: string;
}

const CustomerUserCard = ({username, id, email, date }: Props) => {

  const router = useRouter(); 

  return (
    <>
    <Card>
    <CardHeader>
      <CardTitle>User details</CardTitle>
      <CardDescription>
        Viewing user details for
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
        <div className="flex flex-col gap-1">
          <div className="font-semibold">ID:</div>
          <div>{id}</div>
        </div>
      </div>
      <Separator />
        <Button 
        className="bg-black text-white border border-black" 
        variant={"ghost"} 
        onClick = {()=> {
            router.push("/account/password")
        }}
        >
            Change Password
        </Button>
      <Separator />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{"Member Since:"}</div>
          <div>{date}</div>
        </div>
      </div>
    </CardContent>
  </Card>
  </>
  )
}

export default CustomerUserCard;