import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { SkipLink } from "@/components/layout/SkipLink";
import { getCurrentUser } from "@/lib/session";
import authImage from "@/public/assets/auth.jpg";

// Sign-in and sign-up: the form on the white canvas, the studio photo beside it on large screens.
// Someone already signed in goes back to the store.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <SkipLink />
      <div className="relative max-lg:hidden">
        <Image src={authImage} alt="" fill priority placeholder="blur" sizes="50vw" className="object-cover" />
      </div>
      <div className="flex flex-col">
        <header className="px-6 py-5 sm:px-10">
          <Link href="/" className="inline-flex rounded-sm">
            <Logo />
            <span className="sr-only">, back to the store</span>
          </Link>
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 pb-16 outline-none sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
