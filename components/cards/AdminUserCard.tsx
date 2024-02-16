"use client"

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props{
  username: string;
  id: string;
  email: string;
  date: string;
  addresses: any[];
  admin: boolean
}

const AdminUserCard = ({username, id, email, date , addresses, admin}: Props) => {
  const router = useRouter();

  const handleBack = () => {  
    router.back();
  }

  return (
    <>
    <Button className="flex px-6 border border-black" variant="ghost" onClick={handleBack}>
      <Image
        src="/assets/back.png"
        alt="go back icon"
        width={32}
        height={32}
        className="px-1"
      />
      <span className="ml-2">Go Back</span>
    </Button>
    <br>
    </br>
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
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${admin ? "hidden" : ""}`}>
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Shipping addresses</div>
          {addresses.map((address, index) => 
           <div key={index}>
            {address.name}
           <br />
            {address.address.line1}
            {address.address.line2}
           <br />
            {`${address.address.city}, ${address.address.city} ${address.address.postal_code}`}
          </div>
          )}
        </div>
      </div>

      {admin && (
       <div className={`grid grid-cols-1 gap-4 md:grid-cols-2`}>
           <div className="flex flex-col gap-1">
              <div className="font-semibold">Administrator</div>
            </div>
        </div>
      )
      }
      <Separator />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{admin ? "Admin Since:" : "Member Since:"}</div>
          <div>{date}</div>
        </div>
      </div>
    </CardContent>
  </Card>
  </>
  )
}

export default AdminUserCard