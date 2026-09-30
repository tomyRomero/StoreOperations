import Cart from '@/components/checkout/Cart'
import { getStoreSettings } from '@/lib/data/catalog'
import React from 'react'

const page = async () => {
  // Shipping comes from Store settings, so the cart shows what checkout will charge
  const settings = await getStoreSettings()

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
        <Cart
          shippingFlatRateCents={settings?.shippingFlatRateCents ?? null}
          freeShippingThresholdCents={settings?.freeShippingThresholdCents ?? null}
        />
    </section>
  )
}

export default page
