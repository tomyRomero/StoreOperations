import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "../globals.css";
import { getServerSession } from "next-auth/next";
import SessionProvider from "../../components/SessionProvider"
import Footer from "@/components/shared/Footer";
import { AppProvider } from "@/lib/AppContext";
import AdminNav from "@/components/shared/AdminNav";
import AdminDashboard from "@/components/shared/AdminDashboard";
import MobileAdminDashboard from "@/components/shared/MobileAdminDashboard";

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "PaletteHub Admin",
  description: "Admin Panel for PaletteHub",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession();

  return (

    <html lang="en">
    <AppProvider>
      <SessionProvider session={session}>
        <body className={`${jost.className} flex flex-col min-h-screen`}>
          <AdminNav/>
            <div className="mt-32 max-sm:mt-24 grid h-screen min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
            <AdminDashboard />
              <div className="flex flex-col">
              <MobileAdminDashboard />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 md:pt-24 max-sm:pt-20 lg:pt-0">
                  <section>{children}</section>
                </main>
              </div>
            </div>
        </body>
      </SessionProvider>
    </AppProvider>
  </html>

  );
}
