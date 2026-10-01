import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { parseTheme, themeCookie } from "@/lib/theme";
import { fontVariables } from "./fonts";

// Each page sets its own title, shown with the store's name from Store settings: "Oil Paint Set · Palettehub"
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const storeName = settings?.storeName ?? "Palettehub";
  return {
    metadataBase: siteUrl,
    title: { default: storeName, template: `%s · ${storeName}` },
    description: "Artist-grade paint, brushes and canvas, shipped across the US.",
  };
}

// The one document every page shares: the storefront, the account pages, sign-in and the admin. Each
// group's own layout adds its navigation. Who is signed in is read once here and shared with client components.
// A visitor who picked light or dark gets it on <html>; without a choice the page follows their device.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  const theme = parseTheme(cookieStore.get(themeCookie)?.value);

  return (
    <html lang="en" className={fontVariables} data-theme={theme}>
      <body className="flex min-h-screen flex-col">
        <CurrentUserProvider user={user}>
          {children}
          <Toaster />
        </CurrentUserProvider>
      </body>
    </html>
  );
}
