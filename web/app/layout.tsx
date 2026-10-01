import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/session";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "PaletteHub",
  description: "Online Store Operations Manager App with Admin Dashboard",
};

// The one document every page shares: the storefront, the account pages, sign-in and the admin. Each
// group's own layout adds its navigation. Who is signed in is read once here and shared with client components.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${jost.className} flex flex-col`}>
        <CurrentUserProvider user={user}>
          {children}
          <Toaster />
        </CurrentUserProvider>
      </body>
    </html>
  );
}
