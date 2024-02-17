
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { OrderRow } from "@/components/tables/OrderRow"
import { findAllOrdersForAdmin } from "@/lib/actions/admin.actions"
import SearchBar from "@/components/forms/SearchBar"
import Pagination from "@/components/shared/Pagination"

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
})=> {

  const searchString = searchParams.q; //search string
  const pageNumber = searchParams.page ? + searchParams.page : 1; //page number
  const pageSize = 7; 
  const sortBy = "desc"; 

  //Add pagination later
  const { orders, isNext } = await findAllOrdersForAdmin({
    searchString,
    pageNumber,
    pageSize,
    sortBy,
  })

  const createPaginationPath = ()=> {
    // Create a new URLSearchParams object
   const params = new URLSearchParams();  

   //Add the search parameter to the URLSearchParams
   params.append('q', searchParams.q ? searchParams.q || searchParams.q : "");

   // Get the final query string
   const queryString = params.toString();

   //include the queryString in pagination
   return `/adminorders?${queryString}&`
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
    <div className="grid min-h-screen w-full overflow-hidden grid-cols-1">
      <div className="flex flex-col">
          
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="text-heading3-bold">Orders</h1>
          </div>
          <SearchBar routeType="adminorders" placeholder={"Search for Orders by ID, Customer ID or Status"}/>
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
    <Pagination
          path={createPaginationPath()}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={isNext}
        />
    </section>
  )
}

export default page;

