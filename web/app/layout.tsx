import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/session";

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

export const metadata: Metadata = {
  title: "PaletteHub",
  description: "Online Store Operations Manager App with Admin Dashboard",
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
