import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "PaletteHub Auth",
  description: "Auth for Online Store Operations Manager App with Admin Dashboard",
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return <div className="mx-auto w-full bg-white">{children}</div>;
}
