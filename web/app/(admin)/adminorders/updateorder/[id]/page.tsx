import OrderForm from "@/components/forms/OrderForm"
import ErrorMessage from "@/components/shared/Error"
import { getAdminOrder } from "@/lib/data/admin-orders"
import { getAdminSettings } from "@/lib/data/admin-store"

const page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const [order, settings] = await Promise.all([getAdminOrder(params.id), getAdminSettings()])

  if (!order || !settings)
  {
    return (
      <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
        <ErrorMessage />
      </section>
    )
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      {/* A new version of the order (after a conflict, or a save) starts the form again from it */}
      <OrderForm key={order.rowVersion} order={order} emailByDefault={settings.emailCustomerOnStatusUpdateByDefault} />
    </section>
  )
}

export default page
