import Nav from "@/components/nav/Nav";
import Footer from "@/components/shared/Footer";
import { redirect } from "next/navigation";
import { CartProvider } from "@/components/cart/CartProvider";
import { getCurrentUser } from "@/lib/session";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (user?.isAdmin) {
    redirect("/adminactivity");
  }

  return (
    <CartProvider>
      <Nav />
      <main className="flex flex-col items-center">
        <section className="main-container w-full mt-0.5 z-10! overflow-auto">{children}</section>
        <br />
      </main>
      <Footer />
    </CartProvider>
  );
}
