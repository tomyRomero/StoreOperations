import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { getServerSession } from "next-auth";
import Link from "next/link"
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllProducts, getAllProductsWithoutSort } from "@/lib/actions/store.actions";
import ProductRow from "@/components/tables/ProductRow";
import Pagination from "@/components/shared/Pagination";

export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  const results = await getAllProductsWithoutSort(
    searchParams.page ? + searchParams.page : 1,
     6,
  );

  return (
    <section className="grid grid-cols-1 md:pt-24 max-sm:pt-20 lg:pt-0">
          <div className="flex items-center">
            <h1 className="font-semibold text-heading4-bold">Products</h1>
              <Link href="/adminaddproduct" className="ml-auto">
            <Button className="ml-auto" size="sm">
              Add product
            </Button>
              </Link>
          </div>
          <div className="mt-4 border shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black w-[80px]">Image</TableHead>
                <TableHead className="font-bold text-black max-w-[150px]">Name</TableHead>
                <TableHead className="font-bold text-black">Action</TableHead>
                <TableHead className="font-bold text-black">Inventory</TableHead>
                <TableHead className="font-bold text-black">Price</TableHead>
                <TableHead className="font-bold text-black max-w-[150px]">Stripe ID</TableHead>
                <TableHead className="font-bold text-black">Category</TableHead>
                <TableHead className="font-bold text-black">Creation Date</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.results.map((product)=> (
                 <ProductRow 
                 key={product.stripeProductId}
                 stripeProductId={product.stripeProductId} 
                 name={product.name} 
                 description={product.description}
                 stock={product.stock}
                 price={product.price}
                 category={product.category}
                 photo={product.photo}
                 date={product.date}
                 />
              ))}
            </TableBody>
            </Table>
            {results.results.length === 0 && <h1 className="p-10">
              No products Have been added, click on add product to get started
              </h1>}
          </div>
          <Pagination
          path={"/adminproducts?"}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={results.isNext}
        />
    </section>
  )
}
