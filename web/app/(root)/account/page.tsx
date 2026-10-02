import Link from "next/link";
import { ArrowRight, KeyRound, MapPin, Package } from "lucide-react";
import { LatestOrder } from "@/components/account/LatestOrder";
import { getAddresses, getOrder, getOrders } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import { requireUser } from "@/lib/session";

// A greeting, the latest order and how far it has got, and the way to everything else
export default async function AccountOverviewPage() {
  const user = await requireUser("/account");
  const [orders, addresses, settings] = await Promise.all([getOrders(1, 1), getAddresses(), getStoreSettings()]);
  const latestNumber = orders?.items[0]?.orderNumber;
  const latest = latestNumber ? await getOrder(latestNumber) : null;
  const orderCount = orders?.totalCount ?? 0;
  const defaults = addresses?.filter((address) => address.isDefault).length ?? 0;

  const tiles = [
    { href: "/account/orders", icon: Package, glow: "bg-glow-blue", title: "Orders", text: orders ? (orderCount === 1 ? "1 order so far" : `${orderCount} orders so far`) : "Track and review", cta: "See all" },
    {
      href: "/account/myaddresses",
      icon: MapPin,
      glow: "bg-glow-green",
      title: "Addresses",
      text: addresses ? (addresses.length === 0 ? "None saved yet" : `${addresses.length} saved${defaults ? ", 1 default" : ""}`) : "Where we ship",
      cta: "Manage",
    },
    { href: "/account/password", icon: KeyRound, glow: "bg-glow-violet", title: "Password", text: "Change it any time", cta: "Update" },
  ];

  return (
    <div className="grid gap-7">
      <div className="grid gap-2">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">Hi, {user.username}</h1>
        <p className="text-muted-foreground">
          {orderCount === 0 ? "Nothing ordered yet. Your orders will show up here." : orderCount === 1 ? "You've placed 1 order. Here's how it's going." : `You've placed ${orderCount} orders. Here's the latest.`}
        </p>
      </div>

      {latest && settings ? (
        <LatestOrder order={latest} timeZone={settings.timeZoneId} />
      ) : (
        <section aria-labelledby="latest-heading" className="grid justify-items-start gap-4 rounded-[28px] border bg-card p-6 sm:p-7">
          <h2 id="latest-heading" className="font-sans text-[22px] font-semibold tracking-[-0.02em]">
            {orders === null ? "We couldn't load your orders" : "No orders yet"}
          </h2>
          <p className="text-muted-foreground">{orders === null ? "Try again in a moment." : "When you place an order, you can follow it here, from the warehouse to your door."}</p>
          <Link href="/products" className="inline-flex h-11.5 items-center gap-2 rounded-button bg-primary px-5.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
            Start shopping
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      )}

      <nav aria-label="More in your account" className="grid gap-4 sm:grid-cols-3">
        {tiles.map(({ href, icon: Icon, glow, title, text, cta }) => (
          <Link
            key={href}
            href={href}
            className="group relative isolate grid gap-4.5 overflow-hidden rounded-[24px] border bg-card p-6 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-foreground/22 motion-reduce:hover:translate-y-0 max-sm:grid-cols-[auto_minmax(0,1fr)] max-sm:items-center max-sm:gap-4 max-sm:p-5"
          >
            <span aria-hidden className={`absolute -bottom-15 -right-10 -z-10 size-45 rounded-full opacity-[calc(0.22*var(--glow-strength))] blur-[50px] ${glow}`} />
            <span className="grid size-11 place-items-center rounded-[14px] bg-foreground/6">
              <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="grid gap-1">
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </span>
            <span aria-hidden className="text-sm font-semibold text-ink-2 group-hover:text-foreground max-sm:hidden">
              {cta} →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
