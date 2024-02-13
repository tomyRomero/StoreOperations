
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { OrderRow } from "@/components/tables/OrderRow"
import { findAllOrdersForAdmin } from "@/lib/actions/admin.actions"

const page = async ()=> {

  //Add pagination later
  const orders = await findAllOrdersForAdmin()

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
    <div className="grid min-h-screen w-full overflow-hidden grid-cols-1">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="border shadow-sm rounded-lg p-2">
            <Table >
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-black">Order</TableHead>
                  <TableHead className="font-bold text-black text-center">Details</TableHead>
                  <TableHead className="font-bold text-black ">Status</TableHead>
                  <TableHead className="font-bold text-black text-left">Total</TableHead>
                  <TableHead className="font-bold text-black text-center">Address</TableHead>
                  <TableHead className="font-bold text-black text-center">Customer</TableHead>
                  <TableHead className="font-bold text-black text-center w-[150px]" >Date</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <OrderRow key={index} orderId={order.orderId} total={order.pricing.total} address={order.address} status={order.status} user={order.user.toString()} date={order.date}/>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
    </section>
  )
}

export default page;

