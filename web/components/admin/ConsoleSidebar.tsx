import Link from "next/link";
import { StoreOpsMark } from "@/components/brand/StoreOpsMark";
import { AdminNav } from "./AdminNav";
import { AdminUserMenu } from "./AdminUserMenu";
import { StoreCard } from "./StoreCard";

export type ConsoleProps = {
  storeName: string;
  payments: "live" | "test" | "off";
  // Paid orders not shipped yet
  toShip: number;
};

// What the sidebar holds, on large screens and in the phone drawer: StoreOps, the store it runs, the
// sections and who is signed in
export function ConsoleSidebar({ storeName, payments, toShip, onNavigate }: ConsoleProps & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-3.5">
      <Link href="/admin" onClick={onNavigate} className="flex w-fit items-center gap-2.5 rounded-lg px-1.5 py-0.5">
        <StoreOpsMark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">StoreOps</span>
        <span className="sr-only">, console home</span>
      </Link>
      <StoreCard storeName={storeName} payments={payments} />
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-1">
        <AdminNav toShip={toShip} onNavigate={onNavigate} />
      </div>
      <AdminUserMenu />
    </div>
  );
}
