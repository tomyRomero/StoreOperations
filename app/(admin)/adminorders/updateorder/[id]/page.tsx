import OrderForm from "@/components/forms/OrderForm"
import { findOrder } from "@/lib/actions/store.actions"

const page = async ({ params }: { params: { id: string } }) => {

  const order = await findOrder(params.id)
  console.log("order:", order)

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
       <OrderForm orderId={params.id} status={order.status} estimatedDelivery={order.deliveryDate} trackingNumber={order.trackingNumber}/>
    </section>
  )
}

export default page