import { Suspense } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CartProvider } from "@/components/cart/CartProvider";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { SkipLink } from "@/components/layout/SkipLink";
import { getStoreSettings } from "@/lib/data/catalog";

// Checkout's own frame, with nothing to wander off to: the store's name (back to the store), where the
// shopper is in checkout, and that it's secure. The bag is still there for the order summary.
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  const storeName = settings?.storeName ?? "Palettehub";

  return (
    <CartProvider>
      <SkipLink />
      <header className="border-b bg-background/75 backdrop-blur-xl">
        <div className="container grid h-15 grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-19">
          <Link href="/" className="justify-self-start rounded-lg">
            <Logo name={storeName} compact />
            <span className="sr-only">, back to the store</span>
          </Link>
          <Suspense>
            <CheckoutSteps />
          </Suspense>
          <p className="flex items-center gap-2 justify-self-end text-[13px] text-muted-foreground">
            <LockKeyhole className="size-[15px]" aria-hidden />
            <span className="max-sm:sr-only">Secure checkout</span>
          </p>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="relative isolate flex-1 overflow-x-clip outline-none">
        <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(139_108_255/0.16),transparent_70%)] opacity-(--glow-strength)" />
        {children}
      </main>
      <footer className="container flex flex-wrap justify-between gap-x-6 gap-y-2 border-t py-6 font-mono text-xs text-faint">
        <p>
          © {new Date().getFullYear()} {storeName}
        </p>
        <nav aria-label="Help" className="flex gap-5">
          <Link href="/shipping-returns" className="hover:text-foreground">
            Shipping and returns
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact us
          </Link>
        </nav>
      </footer>
    </CartProvider>
  );
}
