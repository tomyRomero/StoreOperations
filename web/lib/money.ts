const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Money travels as whole cents, as the API and Stripe keep it. This is the one place it becomes "$18.50".
export function formatMoney(cents: number): string {
  return dollars.format(cents / 100);
}
