import UnsubscribeButton from "@/components/forms/UnsubscribeButton"
import { getStoreSettings } from "@/lib/data/catalog"

// Every newsletter links here with the subscriber's own token. The token alone is enough to leave,
// so nobody has to sign in, and nothing on this page says whether the address is still subscribed.
const page = async (props: { params: Promise<{ token: string }> }) => {
  const params = await props.params;
  const settings = await getStoreSettings()

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <div className="mx-auto max-w-lg p-6 bg-white rounded-lg shadow-md text-center grid gap-4">
        <h1 className="text-heading3-bold">Unsubscribe from the {settings?.storeName ?? "store's"} newsletter?</h1>
        <p className="text-gray-600">You&apos;ll stop getting our newsletter. Emails about your orders still arrive as usual.</p>
        <UnsubscribeButton token={params.token} />
      </div>
    </section>
  )
}

export default page
