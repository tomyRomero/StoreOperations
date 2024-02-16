import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../globals.css";
import { getServerSession } from "next-auth/next";
import SessionProvider from "../../components/SessionProvider"
import { AppProvider } from "@/lib/AppContext";
import AdminNav from "@/components/nav/AdminNav";
import AdminDashboard from "@/components/nav/AdminDashboard";
import MobileAdminDashboard from "@/components/nav/MobileAdminDashboard";
import { Toaster } from "@/components/ui/toaster";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "PaletteHub Admin",
  description: "Admin Panel for Online Store Operations Manager App with Admin Dashboard",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if(!session || session?.user.admin === false || session === undefined)
  {
    redirect("/")
  }

  return (

    <html lang="en">
    <AppProvider>
      <SessionProvider session={session}>
        <body className={`${jost.className} flex flex-col min-h-screen`}>
          <AdminNav/>
            <div className="max-xxs:pt-16 pt-20 md:pt-24 lg:pt-32 grid h-screen min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <AdminDashboard />
              <div className="flex flex-col">
              <MobileAdminDashboard />
                <main className="flex flex-1 p-4 flex-col max-xxs:pt-16 md:pt-6 sm:pt-20 lg:pt-4">
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
