
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../../globals.css";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaletteHub Admin",
  description: "Admin Page for PaletteHub App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (

      <html lang='en'>
        <body className={`${inter.className} bg-white`}>
        <div className="mx-auto w-full">
          {/* <SessionProvider session={session}>  */}
            {children}
          {/* </SessionProvider>  */}
        </div>
        </body>
      </html>

  );
}