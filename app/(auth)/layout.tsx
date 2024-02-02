
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../globals.css";
import { getServerSession } from "next-auth";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaletteHub Auth",
  description: "Auth for PaletteHub App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession();

  return (

      <html lang='en'>
        <body className={`${inter.className} bg-white`}>
        <div className="mx-auto w-full">
            {children}
        </div>
        <Toaster />
        </body>
      </html>

  );
}