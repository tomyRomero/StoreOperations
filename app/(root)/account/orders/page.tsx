
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function page() {
  return (
    <Card>
      <CardHeader className="flex items-center space-y-0">
        <CardTitle>Order History</CardTitle>
        <Button className="ml-auto" size="sm" variant="secondary">
          Contact support
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center p-4">
              <div className="font-medium">Order #3202</div>
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">Shipped</div>
            </div>
            <div className="border-t" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start p-4 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <div className="font-medium">Items</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      alt="Product image"
                      className="rounded-md aspect-square object-cover"
                      height="100"
                      src="/placeholder.svg"
                      width="100"
                    />
                    <div className="grid gap-0.5">
                      <div className="font-medium">Glimmer Lamps</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">x1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      alt="Product image"
                      className="rounded-md aspect-square object-cover"
                      height="100"
                      src="/placeholder.svg"
                      width="100"
                    />
                    <div className="grid gap-0.5">
                      <div className="font-medium">Aqua Filters</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">x1</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Order Date</div>
                <div>June 23, 2022</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Order Total</div>
                <div>$120.00</div>
              </div>
            </div>
            <div className="border-t" />
            <div className="flex items-center p-4">
              <Button size="sm" variant="outline">
                Track order
              </Button>
              <Button className="ml-auto" size="sm" variant="outline">
                View details
              </Button>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center p-4">
              <div className="font-medium">Order #3203</div>
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">Paid</div>
            </div>
            <div className="border-t" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start p-4 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <div className="font-medium">Items</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      alt="Product image"
                      className="rounded-md aspect-square object-cover"
                      height="100"
                      src="/placeholder.svg"
                      width="100"
                    />
                    <div className="grid gap-0.5">
                      <div className="font-medium">Glimmer Lamps</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">x1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      alt="Product image"
                      className="rounded-md aspect-square object-cover"
                      height="100"
                      src="/placeholder.svg"
                      width="100"
                    />
                    <div className="grid gap-0.5">
                      <div className="font-medium">Aqua Filters</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">x1</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Order Date</div>
                <div>June 23, 2022</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Order Total</div>
                <div>$120.00</div>
              </div>
            </div>
            <div className="border-t" />
            <div className="flex items-center p-4">
              <Button size="sm" variant="outline">
                Track order
              </Button>
              <Button className="ml-auto" size="sm" variant="outline">
                View details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

