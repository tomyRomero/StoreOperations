import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../globals.css";
import { getServerSession } from "next-auth/next";
import SessionProvider from "../../components/SessionProvider"
import { AppProvider } from "@/lib/AppContext";
import AdminNav from "@/components/shared/AdminNav";
import AdminDashboard from "@/components/shared/AdminDashboard";
import MobileAdminDashboard from "@/components/shared/MobileAdminDashboard";
import { Toaster } from "@/components/ui/toaster";

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
            <div className="max-xxs:mt-16 mt-20 md:mt-24 lg:mt-32 grid h-screen min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <AdminDashboard />
              <div className="flex flex-col">
              <MobileAdminDashboard />
                <main className="flex flex-1 p-4 flex-col max-xxs:mt-8 md:pt-0 sm:pt-20 lg:pt-4">
                  <section>{children}</section>
                </main>
              </div>
            </div>
        <Toaster />
        </body>
      </SessionProvider>
    </AppProvider>
  </html>

  );
}
