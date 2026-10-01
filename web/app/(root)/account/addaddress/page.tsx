import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddAddressForm from "@/components/forms/AddAddressForm";

export const metadata: Metadata = { title: "Add an address" };

export default function AddAddressPage() {
  return (
    <div className="grid max-w-2xl gap-6">
      <Link href="/account/myaddresses" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Addresses
      </Link>
      <div className="grid gap-1">
        <h1 className="text-h1">Add an address</h1>
        <p className="text-muted-foreground">We ship within the United States.</p>
      </div>
      <AddAddressForm />
    </div>
  );
}
