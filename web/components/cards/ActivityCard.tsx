import React from 'react'
import Link from 'next/link'
import type { ActivityEntry, OrderStatus } from '@/lib/api/types'
import { calculateTimeAgo } from '@/lib/utils'
import { formatDate, orderStatusLabel } from '@/lib/format'
import { formatMoney } from '@/lib/money'

// One value from the entry's details, which differ by action (see the API's activity entries)
function detail(entry: ActivityEntry, key: string): string | number | boolean | undefined {
  const details = entry.details
  if (typeof details !== "object" || details === null) return undefined
  const value = (details as Record<string, unknown>)[key]
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : undefined
}

// What happened, in a sentence, and where to see it. Older entries may lack some details, so every
// sentence still reads without them.
export function describe(entry: ActivityEntry): { text: string; href?: string } {
  const who = entry.actor ?? "Someone"
  const name = detail(entry, "name") ?? "a product"
  const username = detail(entry, "username") ?? "an account"
  const orderNumber = detail(entry, "orderNumber")
  const id = entry.entityId

  switch (entry.action) {
    case "user_registered":
      return { text: `${detail(entry, "username") ?? "Someone"} created an account`, href: id ? `/adminusers/${id}` : undefined }
    case "customer_disabled":
      return { text: `${who} disabled ${username}`, href: id ? `/adminusers/${id}` : undefined }
    case "customer_enabled":
      return { text: `${who} enabled ${username} again`, href: id ? `/adminusers/${id}` : undefined }
    case "admin_role_granted":
      return { text: `${username} was made an admin on the server`, href: id ? `/adminusers/${id}` : undefined }
    case "admin_role_removed":
      return { text: `${username} is no longer an admin`, href: id ? `/adminusers/${id}` : undefined }
    case "newsletter_subscribed":
      return { text: "Someone subscribed to the newsletter", href: "/adminnewsletter" }
    case "newsletter_unsubscribed":
      return { text: "Someone unsubscribed from the newsletter", href: "/adminnewsletter" }
    case "subscribers_removed":
      return { text: `${who} removed ${detail(entry, "count") ?? "some"} subscribers`, href: "/adminnewsletter" }
    case "newsletter_sent":
      return { text: `${who} sent "${detail(entry, "subject") ?? "a newsletter"}" to ${detail(entry, "recipients") ?? "the"} subscribers` }
    case "order_created": {
      const total = detail(entry, "totalCents")
      const refunded = detail(entry, "refunded") === true ? ", then refunded it" : ""
      return {
        text: `New order${orderNumber ? ` #${orderNumber}` : ""}${typeof total === "number" ? ` for ${formatMoney(total)}` : ""}${refunded}`,
        href: orderNumber ? `/adminorders/${orderNumber}` : undefined,
      }
    }
    case "order_status_changed": {
      const to = detail(entry, "to")
      const refunded = detail(entry, "refundedCents")
      return {
        text: `${who} marked order${orderNumber ? ` #${orderNumber}` : ""} ${typeof to === "string" ? orderStatusLabel(to as OrderStatus).toLowerCase() : "changed"}` +
          (typeof refunded === "number" ? ` and refunded ${formatMoney(refunded)}` : ""),
        href: orderNumber ? `/adminorders/${orderNumber}` : undefined,
      }
    }
    case "product_created":
      return { text: `${who} added ${name}`, href: id ? `/adminaddproduct/${id}` : undefined }
    case "product_updated":
      return { text: `${who} updated ${name}`, href: id ? `/adminaddproduct/${id}` : undefined }
    case "product_archived":
      return { text: `${who} archived ${name}`, href: id ? `/adminaddproduct/${id}` : undefined }
    case "product_restored":
      return { text: `${who} put ${name} back in the store`, href: id ? `/adminaddproduct/${id}` : undefined }
    case "deal_started": {
      const price = detail(entry, "dealPriceCents")
      return { text: `${who} started a deal on ${name}${typeof price === "number" ? ` at ${formatMoney(price)}` : ""}`, href: id ? `/adminaddproduct/deal/${id}` : undefined }
    }
    case "deal_ended":
      return { text: `${who} ended the deal on ${name}`, href: id ? `/adminaddproduct/${id}` : undefined }
    case "category_created":
      return { text: `${who} added the ${detail(entry, "name") ?? ""} category`, href: id ? `/adminaddcategory/${id}` : undefined }
    case "category_updated": {
      const previous = detail(entry, "previousName")
      return {
        text: previous && previous !== detail(entry, "name")
          ? `${who} renamed the ${previous} category to ${detail(entry, "name")}`
          : `${who} updated the ${detail(entry, "name") ?? ""} category`,
        href: id ? `/adminaddcategory/${id}` : undefined,
      }
    }
    case "category_deleted":
      return { text: `${who} deleted the ${detail(entry, "name") ?? ""} category` }
    case "settings_changed":
      return { text: `${who} changed the store settings`, href: "/adminsettings" }
  }
}

const ActivityCard = ({ entry, timeZone, now }: { entry: ActivityEntry; timeZone: string; now: Date }) => {
  const { text, href } = describe(entry)

  return (
    <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
      <span className="font-medium">{href ? <Link className="hover:underline" href={href}>{text}</Link> : text}</span>
      <time className="ml-auto text-sm text-gray-500" dateTime={entry.occurredAtUtc} title={formatDate(entry.occurredAtUtc, timeZone)}>
        {calculateTimeAgo(now, entry.occurredAtUtc)}
      </time>
    </li>
  )
}

export default ActivityCard
