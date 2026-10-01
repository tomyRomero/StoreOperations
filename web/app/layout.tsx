import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { fontVariables } from "./fonts";

// Each page sets its own title, shown as "Oil Paint Set · Palettehub"
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Palettehub · Art supplies", template: "%s · Palettehub" },
  description: "Artist-grade paint, brushes and canvas, shipped across the US.",
};

// The one document every page shares: the storefront, the account pages, sign-in and the admin. Each
// group's own layout adds its navigation. Who is signed in is read once here and shared with client components.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <CurrentUserProvider user={user}>
          {children}
          <Toaster />
        </CurrentUserProvider>
      </body>
    </html>
  );
}
