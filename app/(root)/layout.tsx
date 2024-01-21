import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "../globals.css";
import Nav from "@/components/shared/Nav";


const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "ShopHub",
  description: "Online Store for all things creative",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jost.className}>
        <Nav />
        <main className='flex flex-row'>
          <section className='main-container'>
            <div className='w-full max-w-4xl'>{children}</div>
          </section>
        </main>      
      </body>
    </html>
  );
}
