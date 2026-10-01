import AdminUserCard from "@/components/cards/AdminUserCard";
import ErrorMessage from "@/components/shared/Error";
import { getAdminCustomer } from "@/lib/data/admin-customers";
import { getStoreSettings } from "@/lib/data/catalog";

const page = async (props: { params: Promise<{ id: string }> })=> {
  const params = await props.params;

  const [customer, settings] = await Promise.all([getAdminCustomer(Number(params.id)), getStoreSettings()])

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
      {customer && settings ? <AdminUserCard customer={customer} timeZone={settings.timeZoneId} /> : <ErrorMessage />}
    </section>
  )
}

export default page;
