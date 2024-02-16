import { CardTitle, CardHeader, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CustomerOrder from "@/components/cards/CustomerOrder"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findAllOrdersForUser, findProduct } from "@/lib/actions/store.actions"
import Pagination from "@/components/shared/Pagination"

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getServerSession(authOptions);
  let userOrders = [];
  let isNext = false;

  if (session) {
    const results = await findAllOrdersForUser(
      session.user.id,
      searchParams.page ? + searchParams.page : 1,
      2, );
     
    userOrders = results.orders 
    isNext = results.isNext
  }

  const getProducts = async (items:{ product: string; quantity: number; }[]) => {
    const data:{
      product: string;
      quantity: number;
  }[] = [];
    await Promise.all(
      items.map(async (item) => {
        try {
          const product = await findProduct(item.product);
          if (product) {
            data.push({
              product: product.name,
              quantity: item.quantity,
            });
          } else {
            data.push({
              product: "Product not found",
              quantity: 0,
            });
          }
        } catch (error) {
          console.log(error);
        }
      })
    );
    return data;
  };

  if (userOrders.length === 0) {
    return (
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
        <Card>
          <CardHeader className="flex items-center space-y-0">
            <CardTitle className="text-heading3-bold">Order History</CardTitle>
            <br />
            <Link href="/contact" className="ml-auto max-md:mx-auto">
              <Button className="bg-black text-white border border-black" size="sm" variant="ghost">
                Contact support
              </Button>
            </Link>
            <br />
            <p className="text-heading3-bold">No Orders Have Been Made</p>
            <br />
            <Link href="/products">
              <Button className="bg-black text-white border border-black hover:bg-white hover:text-black" variant={"link"}>
                Start Shopping
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      <Card>
        <CardHeader className="flex items-center space-y-0">
          <CardTitle className="text-heading3-bold">Order History</CardTitle>
          <br />
          <Link href="/contact" className="ml-auto max-md:mx-auto">
            <Button className="bg-black text-white border border-black" size="sm" variant="ghost">
              Contact support
            </Button>
          </Link>
          <br />
          {userOrders.map(async (order, index) => (
            <CustomerOrder
              key={index}
              orderId={order.orderId}
              items={await getProducts(order.items)}
              date={order.date}
              status={order.status}
              tracking={order.trackingNumber}
              pricing={order.pricing}
            />
          ))}
        </CardHeader>
      </Card>

      <Pagination
          path={"/account/orders?"}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={isNext}
        />
    </section>
  );
};

export default page;
