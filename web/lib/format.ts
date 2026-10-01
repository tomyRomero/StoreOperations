import type { Carrier, OrderStatus, PostalAddress, StoreSettings } from "./api/types";
import { formatMoney } from "./money";

// How the API's values read on a page. Money has its own file (money.ts).

// "Sep 30, 2026" for a moment the API sends in UTC, on the store's calendar (its time zone from /api/store)
export function formatDate(utc: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone }).format(new Date(utc));
}

// A date without a time (an estimated delivery day) is already a calendar day: shown as written
export function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function addressLines(address: PostalAddress): string[] {
  const cityLine = [address.city, [address.state, address.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [address.line1, address.line2, cityLine, address.countryCode].filter((line): line is string => Boolean(line));
}

// One line, for a dropdown or a summary: "Ada Lovelace, 1 Main St, Springfield, IL 62701"
export function addressOneLine(address: PostalAddress): string {
  return [address.recipientName, ...addressLines(address).slice(0, -1)].join(", ");
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Preparing to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function orderStatusLabel(status: OrderStatus): string {
  return statusLabels[status];
}

const carrierNames: Record<Carrier, string> = {
  ups: "UPS",
  usps: "USPS",
  fedex: "FedEx",
  dhl: "DHL",
  other: "Carrier",
};

export function carrierName(carrier: Carrier): string {
  return carrierNames[carrier];
}

// In stock / Only 3 left / Sold out. The threshold is the Store setting for low stock.
export function stockLabel(stock: number, lowStockThreshold: number): string {
  if (stock <= 0) return "Sold out";
  if (stock <= lowStockThreshold) return `Only ${stock} left`;
  return "In stock";
}

// The store's policies in one line each, from Store settings, so no page promises more than checkout
// and the returns desk deliver

export function shippingSummary(settings: Pick<StoreSettings, "shippingFlatRateCents" | "freeShippingThresholdCents">): string {
  if (settings.freeShippingThresholdCents !== null) {
    return settings.shippingFlatRateCents === 0
      ? "Free shipping on every order"
      : `Free shipping on orders over ${formatMoney(settings.freeShippingThresholdCents)}`;
  }
  return settings.shippingFlatRateCents === 0 ? "Free shipping on every order" : `${formatMoney(settings.shippingFlatRateCents)} flat-rate shipping`;
}

export function returnsSummary(settings: Pick<StoreSettings, "returnPolicy" | "returnWindowDays">): string {
  const days = settings.returnWindowDays;
  switch (settings.returnPolicy) {
    case "exchanges":
      return days ? `Exchanges within ${days} days` : "Exchanges accepted";
    case "refunds":
      return days ? `Refunds within ${days} days` : "Refunds accepted";
    default:
      return "All sales are final";
  }
}
