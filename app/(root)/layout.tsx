import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "../globals.css";
import Nav from "@/components/shared/Nav";
import { getServerSession } from "next-auth/next";
import SessionProvider from "../../components/SessionProvider"
import Footer from "@/components/shared/Footer";
import { AppProvider } from "@/lib/AppContext";

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "PaletteHub",
  description: "Online Store with admin dashboard",
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
    <body className={`${jost.className} flex flex-col`}>
      <Nav/>
      <main className="flex flex-col items-center">
        <section className="main-container w-full">{children}</section>
      </main>
      <Footer />
    </body>
    </SessionProvider>
    </AppProvider>
  </html>

  );
}

