import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { getServerSession } from "next-auth";
import Link from "next/link"
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProductsTable from "@/components/tables/ProductsTable";

export default async function page() {

  const session = await getServerSession(authOptions);

  if(session === undefined || session?.user.admin === false)
  {
    redirect("/")
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
          <div className="flex items-center">
            <h1 className="font-semibold">Products</h1>
              <Link href="/adminaddproduct" className="ml-auto">
            <Button className="ml-auto" size="sm">
              Add product
            </Button>
              </Link>
          </div>
    <div className="mt-4 border shadow-sm rounded-lg">
           <ProductsTable />
          </div>
    </section>
  )
}
