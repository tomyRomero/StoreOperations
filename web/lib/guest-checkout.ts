import { useMemo, useSyncExternalStore } from "react";
import type { GuestCheckoutRequest } from "./api/types";

// A guest's first checkout step: where the order's emails go and where it ships. It stays in this tab
// until they pay; the API only sees it when the payment step starts.
export type GuestDetails = Omit<GuestCheckoutRequest, "items">;

const storageKey = "storeops-guest-checkout";

// Session storage can be unavailable; the details then last until the page is reloaded
let inMemory: string | null = null;

export function readGuestDetails(): GuestDetails | null {
  return parse(stored());
}

export function saveGuestDetails(details: GuestDetails) {
  inMemory = JSON.stringify(details);
  try {
    sessionStorage.setItem(storageKey, inMemory);
  } catch {
    // The in-memory copy carries them to the payment step
  }
}

// The details for a component: undefined until the page is running in the browser, then null when
// there are none. They only change on the first step, which this page isn't, so nothing is watched.
export function useGuestDetails(): GuestDetails | null | undefined {
  const raw = useSyncExternalStore(ignoreChanges, stored, () => undefined);
  return useMemo(() => (raw === undefined ? undefined : parse(raw)), [raw]);
}

function ignoreChanges() {
  return () => {};
}

function stored(): string | null {
  try {
    return sessionStorage.getItem(storageKey) ?? inMemory;
  } catch {
    return inMemory;
  }
}

function parse(raw: string | null): GuestDetails | null {
  try {
    const value = JSON.parse(raw ?? "null") as GuestDetails | null;
    return typeof value?.email === "string" && typeof value.address?.line1 === "string" ? value : null;
  } catch {
    return null;
  }
}
