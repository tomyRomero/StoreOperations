import OrderDetailsCards from "@/components/cards/OrderDetailsCards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { findOrder } from "@/lib/actions/store.actions";
import { Card } from "@/components/ui/card";
import { Order } from "@/app/types/global";

const page = async ({ params }: { params: { id: string } }) =>  {

  const order:Order= await findOrder(params.id)
  console.log("order:", order)

  if(!order)
  {
    return(
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
    <Link href={'/adminorders'} className="w-0">
    <Button className="flex px-6 border border-black" variant="ghost">
        <Image
          src="/assets/back.png"
          alt="go back icon"
          width={32}
          height={32}
          className="px-1"
        />
        <span className="ml-2">Go Back</span>
      </Button>
    </Link>

      <div className="flex justify-center py-6">
      <Card className="max-w-2xl p-6">
        <h1 className="text-red-500 text-heading4-bold">Order Was Not Found</h1>
        <br></br>
        <Image src="/assets/error.png" alt="error image"
          width={100}
          height={100}
          className="mx-auto"
        />
        <br></br>
        <p className="text-center">Try Refreshing Or Go Back</p>
      </Card>
      </div>
    </section>
    )
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      <Link href={'/adminorders'} className="w-0">
      <Button className="flex px-6 border border-black" variant="ghost">
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Go Back</span>
        </Button>
        </Link>
        <br></br>
        <div className="flex justify-center">
        <Link href={`/adminorders/updateorder/${params.id}`}>
        <Button className="flex px-2 border border-black justify-center" variant="ghost">
          <Image
            src="/assets/orders.png"
            alt="go back icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Update Order</span>
        </Button>
        </Link>
        </div>
      
      <br></br>
     
      <OrderDetailsCards 
      pricing={order.pricing}
      address={order.address} 
      status={order.status} 
      items={order.items} 
      orderId={order.orderId} 
      user={order.user.toString()}
      date={order.date}
      trackingNumber={order.trackingNumber}
      deliveryDate={order.deliveryDate}
      />
    </section>
  )
}

export default page;