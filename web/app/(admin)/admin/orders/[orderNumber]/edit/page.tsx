import OrderForm from "@/components/forms/OrderForm"
import ErrorMessage from "@/components/shared/Error"
import { getAdminOrder } from "@/lib/data/admin-orders"
import { getAdminSettings } from "@/lib/data/admin-store"

const page = async (props: { params: Promise<{ orderNumber: string }> }) => {
  const params = await props.params;

  const [order, settings] = await Promise.all([getAdminOrder(params.orderNumber), getAdminSettings()])

  if (!order || !settings)
  {
    return (
      <section className="">
        <ErrorMessage />
      </section>
    )
  }

  return (
    <section className="">
      {/* A new version of the order (after a conflict, or a save) starts the form again from it */}
      <OrderForm key={order.rowVersion} order={order} emailByDefault={settings.emailCustomerOnStatusUpdateByDefault} />
    </section>
  )
}

export default page
