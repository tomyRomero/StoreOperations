import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";

// Bricolage Grotesque for display and headings (its optical-size axis keeps small headings readable),
// Figtree for text, UI and numbers. Both are variable fonts served from this site, not from Google.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

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
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CurrentUserProvider user={user}>
          {children}
          <Toaster />
        </CurrentUserProvider>
      </body>
    </html>
  );
}
