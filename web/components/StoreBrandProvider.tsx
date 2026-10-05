"use client";

import { createContext, useContext, type ReactNode } from "react";

export type StoreBrand = {
  name: string;
  logoUrl: string | null;
  // What the store calls what it sells: "supply" and "supplies"
  one: string;
  many: string;
};

// The store's name, logo and product words from Theme and brand, read once by the root layout and shared
// with client components (search, the phone menu, filters). Server components read the settings directly.
const StoreBrandContext = createContext<StoreBrand>({ name: "Our store", logoUrl: null, one: "product", many: "products" });

export function StoreBrandProvider({ brand, children }: { brand: StoreBrand; children: ReactNode }) {
  return <StoreBrandContext.Provider value={brand}>{children}</StoreBrandContext.Provider>;
}

export function useStoreBrand(): StoreBrand {
  return useContext(StoreBrandContext);
}

// "1 supply", "12 supplies"
export function useCountOf(): (n: number) => string {
  const { one, many } = useStoreBrand();
  return (n) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}
