import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "../globals.css";
import Nav from "@/components/shared/Nav";
import { ClerkProvider, currentUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";


const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: "PaletteHub",
  description: "Online Store for all things creative",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  let user;

  try{
  user = await currentUser()
  }catch(error){
    console.log(error)
     user = {};
  }

  return (
    <ClerkProvider
    appearance={{
      baseTheme: dark,
    }}
  >
    <html lang="en">
    <body className={`${jost.className} flex flex-col min-h-screen`}>
      <Nav userid= {user?.id? user.id : null}/>
      <main className="flex flex-col items-center">
        <section className="main-container w-full">{children}</section>
      </main>
    </body>
  </html>
  </ClerkProvider>
  );
}

