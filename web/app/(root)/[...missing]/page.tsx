import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Page not found" };

// Any address no other route matches lands here, so the 404 page below shows inside the store's header
// and footer (the app-wide not-found page would only get the bare root layout).
export default function MissingPage() {
  notFound();
}
