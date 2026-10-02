import type { Metadata } from "next";
import { AccountNav } from "@/components/account/AccountNav";
import { getAddresses, getOrders } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { storeNameOf } from "@/lib/storefront";
import { requireUser } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return { title: { default: "Your account", template: `%s · Your account · ${storeNameOf(settings)}` } };
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  const [orders, addresses] = await Promise.all([getOrders(1, 1), getAddresses()]);

  return (
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden className="absolute -right-20 -top-32 -z-10 h-[420px] w-[700px] max-w-full bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--glow-pink)_16%,transparent),transparent_70%)] opacity-(--glow-strength)" />
      <div className="container grid grid-cols-1 gap-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:py-12">
        {/* The menu scrolls with the page. Account pages are short, so a menu that sticks and then lets go
            only reads as the page jumping. */}
        <div className="min-w-0 lg:self-start">
          <AccountNav username={user.username} email={user.email} orderCount={orders?.totalCount ?? null} addressCount={addresses?.length ?? null} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
