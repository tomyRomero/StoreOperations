import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthArt } from "@/components/auth/AuthArt";
import { Logo } from "@/components/brand/Logo";
import { SkipLink } from "@/components/layout/SkipLink";
import { getDeals, getProducts, getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";
import { stageProducts } from "@/lib/stage";

// Sign-in and sign-up: the store's products in the studio light on large screens (the same three as the
// home page's stage), the form beside them. Someone already signed in goes back to the store.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [user, settings, deals, newest] = await Promise.all([getCurrentUser(), getStoreSettings(), getDeals(), getProducts({ sort: "newest", pageSize: 3 })]);
  if (user) {
    redirect("/");
  }

  return (
    <div className="relative grid min-h-dvh gap-4 p-4 lg:grid-cols-2">
      <SkipLink />
      {/* Over the art's top corner on large screens, above the form on smaller ones */}
      <header className="px-2 pt-1 lg:absolute lg:left-14 lg:top-14 lg:z-10 lg:p-0">
        <Link href="/" className="inline-flex rounded-lg">
          <Logo name={settings?.storeName} />
          <span className="sr-only">, back to the store</span>
        </Link>
      </header>
      <AuthArt products={stageProducts(deals, newest?.items ?? [])} />
      <main id="main" tabIndex={-1} className="flex items-center justify-center px-2 pb-12 pt-6 outline-none sm:px-10 lg:py-10">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
