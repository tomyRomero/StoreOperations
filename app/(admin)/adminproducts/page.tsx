import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table";
import Link from "next/link";
import ProductRow from "@/components/tables/ProductRow";
import Pagination from "@/components/shared/Pagination";
import { findProductsAdmin } from "@/lib/actions/admin.actions";
import SearchBar from "@/components/forms/SearchBar";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const searchString = searchParams?.q || ""; // Fallback to empty string
    const pageNumber = searchParams?.page ? +searchParams.page : 1; // Fallback to page 1
    const pageSize = 5;
    const sortBy = "desc";

    const { products, isNext } = await findProductsAdmin({
      searchString,
      pageNumber,
      pageSize,
      sortBy,
    });

    const createPaginationPath = () => {
      const params = new URLSearchParams();

      if (searchParams.q) {
        params.append("q", searchParams.q);
      }

      return `/adminproducts?${params.toString()}&`;
    };

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
        <br />
        <SearchBar
          routeType="adminproducts"
          placeholder="Search for Products by Name, Stripe ID, Category or Price (Full Price)"
        />
        <div className="mt-4 border shadow-sm rounded-lg">
          {products.length === 0 ? (
            <h1 className="p-10">
              No products have been added, click on add product to get started.
            </h1>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-black w-[80px]">Image</TableHead>
                  <TableHead className="font-bold text-black max-w-[150px]">Name</TableHead>
                  <TableHead className="font-bold text-black text-center">Action</TableHead>
                  <TableHead className="font-bold text-black">Inventory</TableHead>
                  <TableHead className="font-bold text-black">Price</TableHead>
                  <TableHead className="font-bold text-black max-w-[150px]">Stripe ID</TableHead>
                  <TableHead className="font-bold text-black">Category</TableHead>
                  <TableHead className="font-bold text-black">Creation Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
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
                    deal={product.deal}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {products.length > 0 && (
          <Pagination
            path={createPaginationPath()}
            pageNumber={searchParams?.page ? +searchParams.page : 1}
            isNext={isNext}
          />
        )}
      </section>
    );
  } catch (error) {
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
        <br />
        <div className="mt-4 border shadow-sm rounded-lg">
          <h1 className="p-10 text-center text-red-600">
            Failed to load products. Please try again later.
          </h1>
        </div>
      </section>
    );
  }
}