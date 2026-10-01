

import ContactForm from "@/components/forms/ContactForm";
import { storeDetails } from "@/lib/constants"
import { getStoreSettings } from "@/lib/data/catalog";

const page = async ()=> {
  // The support email is a store setting, so the admin can change it without a release
  const settings = await getStoreSettings()

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-heading4-bold font-semibold">Contact Information</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Store Address:</span>
              <span className="font-medium flex-wrap">
                {storeDetails.location}
                <br />
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Contact Information:</span>
              <span className="font-medium">
                Phone: {storeDetails.contact}
                {settings?.supportEmail && (<><br />Email: {settings.supportEmail}</>)}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Store Hours:</span>
              <span className="font-medium">
                Monday - Friday: {storeDetails.hours.mondayToFriday}
                <br />
                Saturday: {storeDetails.hours.saturday}
                <br />
                Sunday: {storeDetails.hours.sunday}
              </span>
            </div>
              </div>
            </div>
        <ContactForm />
      </div>
    </section>
  )
}

export default page;