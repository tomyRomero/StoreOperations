import OrderForm from "@/components/forms/OrderForm"
import ErrorMessage from "@/components/shared/Error"
import { findOrderForAdmin } from "@/lib/data/admin"

const page = async ({ params }: { params: { id: string } }) => {

  const order = await findOrderForAdmin(params.id)

  if(!order)
  {
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      <ErrorMessage />
    </section>
  }
  
  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
       <OrderForm orderId={params.id} status={order.status} estimatedDelivery={order.deliveryDate} trackingNumber={order.trackingNumber}/>
    </section>
  )
}

export default page