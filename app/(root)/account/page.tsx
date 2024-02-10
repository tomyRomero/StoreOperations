import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User details</CardTitle>
        <CardDescription>
          Viewing user details for
          <span className="font-semibold">olivia@example.com</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Username</div>
            <div>olivia</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Email</div>
            <div>olivia@example.com</div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Shipping address</div>
            <div>
              Olivia Martin
              <br />
              1234 Main St.
              <br />
              Anytown, CA 12345
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Billing address</div>
            <div>Same as shipping address</div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Date created</div>
            <div>February 20, 2022</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

