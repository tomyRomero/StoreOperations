import Link from "next/link";
import { ArrowRight, KeyRound, MapPin, Package } from "lucide-react";
import { OrderCard } from "@/components/account/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { getAddresses, getOrders } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { requireUser } from "@/lib/session";

// A greeting, the latest order and the way to everything else
export default async function AccountOverviewPage() {
  const user = await requireUser("/account");
  const [orders, addresses, settings] = await Promise.all([getOrders(1, 1), getAddresses(), getStoreSettings()]);
  const latest = orders?.items[0];

  const links = [
    { href: "/account/orders", icon: Package, title: "Orders", text: orders ? `${orders.totalCount} so far` : "Track and review" },
    { href: "/account/myaddresses", icon: MapPin, title: "Addresses", text: addresses ? `${addresses.length} saved` : "Where we ship" },
    { href: "/account/password", icon: KeyRound, title: "Security", text: "Change your password" },
  ];

  return (
    <div className="grid gap-10">
      <div className="grid gap-2">
        <h1 className="text-h1">Hi, {user.username}</h1>
        <p className="text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <section aria-labelledby="latest-heading" className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="text-h3">
            Latest order
          </h2>
          {latest && (
            <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline">
              All orders
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        {latest && settings ? (
          <OrderCard order={latest} timeZone={settings.timeZoneId} />
        ) : (
          <EmptyState
            icon={Package}
            title="No orders yet"
            action={
              <Button asChild>
                <Link href="/products">Start shopping</Link>
              </Button>
            }
          >
            When you place an order, you can follow it here.
          </EmptyState>
        )}
      </section>

      <section aria-label="Your account" className="grid gap-4 sm:grid-cols-3">
        {links.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group grid gap-3 rounded-md border p-5 transition-colors hover:bg-muted/40">
            <Icon className="size-5" aria-hidden />
            <span className="grid gap-0.5">
              <span className="font-semibold group-hover:underline">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
