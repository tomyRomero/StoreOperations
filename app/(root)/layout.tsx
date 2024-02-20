import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../globals.css";
import Nav from "@/components/nav/Nav";
import { getServerSession } from "next-auth/next";
import SessionProvider from "../../components/SessionProvider"
import Footer from "@/components/shared/Footer";
import { AppProvider } from "@/lib/AppContext";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "PaletteHub",
  description: "Online Store Operations Manager App with Admin Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);

  if(session?.user.admin)
  {
    redirect("/adminactivity")
  }

  return (

    <html lang="en">
    <SessionProvider session={session}>
      <AppProvider>
      <body className={`${jost.className} flex flex-col`}>
        <Nav/>
        <main className="flex flex-col items-center">
          <section className="main-container w-full mt-0.5 !z-10 overflow-auto">
            {children}
            </section>
            <br/>
        </main>

        <Footer />
        <Toaster />
      </body>
      </AppProvider>
    </SessionProvider>
  </html>

  );
}

