import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, PaletteStripe } from "@/components/brand/Logo";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { SkipLink } from "@/components/layout/SkipLink";
import { countOrders } from "@/lib/data/admin-orders";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Palettehub" },
  robots: { index: false },
};

// The admin area: the sections on the left (a drawer on phones), who is signed in at the top
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fail closed: only a user the API confirms as admin gets in. The API also refuses every admin
  // request from anyone else, so this only spares them a broken page.
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const toShip = (await countOrders("pending")) ?? 0;

  return (
    <div className="min-h-screen bg-muted/50 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <SkipLink />
      <aside className="sticky top-0 flex h-screen flex-col border-r bg-card max-lg:hidden">
        <PaletteStripe />
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href="/admin" className="rounded-sm">
            <Logo />
            <span className="sr-only"> admin, dashboard</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <AdminNav toShip={toShip} />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <PaletteStripe className="lg:hidden" />
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-card px-4 lg:px-8">
          <AdminMobileNav toShip={toShip} />
          <Link href="/admin" className="rounded-sm lg:hidden">
            <Logo />
            <span className="sr-only"> admin, dashboard</span>
          </Link>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground max-sm:hidden lg:hidden">Admin</span>
          <div className="ml-auto">
            <AdminUserMenu />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
