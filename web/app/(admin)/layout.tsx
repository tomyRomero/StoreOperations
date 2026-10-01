import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsoleSidebar } from "@/components/admin/ConsoleSidebar";
import { ConsoleTopbar } from "@/components/admin/ConsoleTopbar";
import { SkipLink } from "@/components/layout/SkipLink";
import { countOrders } from "@/lib/data/admin-orders";
import { getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "StoreOps", template: "%s · StoreOps" },
  robots: { index: false },
};

// Test keys take no real money; without a key checkout can't take payments at all
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const payments = !publishableKey ? "off" : publishableKey.startsWith("pk_test_") ? "test" : "live";

// The StoreOps console: its sidebar on the left (a drawer on phones), a top bar, and the page. The console
// marker gives it the StoreOps cobalt and compact controls (see globals.css); light or dark follows the
// same switch as the storefront.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fail closed: only a user the API confirms as admin gets in. The API also refuses every admin
  // request from anyone else, so this only spares them a broken page.
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const [toShip, settings] = await Promise.all([countOrders("pending"), getStoreSettings()]);
  const shell = { storeName: settings?.storeName ?? "Palettehub", payments, toShip: toShip ?? 0 } as const;

  return (
    <div data-console className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <SkipLink />
      <aside className="border-r bg-surface-sunk max-lg:hidden">
        <div className="sticky top-0 h-screen px-3 py-4">
          <ConsoleSidebar {...shell} />
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-col">
        <ConsoleTopbar {...shell} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
