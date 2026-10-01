const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Money travels as whole cents, as the API and Stripe keep it. This is the one place it becomes "$18.50".
export function formatMoney(cents: number): string {
  return dollars.format(cents / 100);
}

// A price typed into a form ("18", "18.5", "18.50") as cents, or null when it isn't a price.
// Read digit by digit, so 0.29 never becomes 28 cents through floating point.
export function parseDollars(text: string): number | null {
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

// Cents as a price field's starting text: 1850 becomes "18.50"
export function dollarsText(cents: number): string {
  return (cents / 100).toFixed(2);
}

// How much a deal takes off the regular price, rounded to a whole percent: 3499 against 4499 is 22
export function percentOff(priceCents: number, regularCents: number): number {
  return regularCents > 0 ? Math.round((1 - priceCents / regularCents) * 100) : 0;
}
