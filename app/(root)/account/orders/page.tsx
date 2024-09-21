import { CardTitle, CardHeader, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CustomerOrder from "@/components/cards/CustomerOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findAllOrdersForUser } from "@/lib/actions/store.actions";
import Pagination from "@/components/shared/Pagination";

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  let userOrders = [];
  let isNext = false;

  try {
    // Attempt to get session
    const session = await getServerSession(authOptions);

    if (session) {
      // Attempt to get orders for the user
      const results = await findAllOrdersForUser(
        session.user.id,
        searchParams.page ? +searchParams.page : 1,
        2
      );
      
      userOrders = results.orders;
      isNext = results.isNext;
    }
  } catch (error) {
    console.error("Failed to fetch session or orders:", error);
    return (
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
        <Card>
          <CardHeader className="flex items-center space-y-0">
            <CardTitle className="text-heading3-bold">Order History</CardTitle>
            <p className="text-heading3-bold text-red-500">Failed to load order history. Please try again later.</p>
            <br />
            <Link href="/contact" className="ml-auto max-md:mx-auto">
              <Button className="bg-black text-white border border-black" size="sm" variant="ghost">
                Contact support
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </section>
    );
  }

  // Helper function to extract product data from order items
  const getProducts = (items: { productName: string; quantity: number }[]) => {
    return items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
    }));
  };

  // If no orders are found
  if (userOrders.length === 0) {
    return (
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
        <Card>
          <CardHeader className="flex items-center space-y-0">
            <CardTitle className="text-heading3-bold">Order History</CardTitle>
            <p className="text-heading3-bold">No Orders Have Been Made</p>
            <br />
            <Link href="/contact" className="ml-auto max-md:mx-auto">
              <Button className="bg-black text-white border border-black" size="sm" variant="ghost">
                Contact support
              </Button>
            </Link>
            <br />
            <Link href="/products">
              <Button className="bg-black text-white border border-black hover:bg-white hover:text-black" variant="link">
                Start Shopping
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </section>
    );
  }

  // Render the orders
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
          {userOrders.map((order, index) => (
            <CustomerOrder
              key={index}
              orderId={order.orderId}
              items={getProducts(order.items)}
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
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={isNext}
      />
    </section>
  );
};

export default page;