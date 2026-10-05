import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { StoreBrandProvider } from "@/components/StoreBrandProvider";
import { PreviewGuard } from "@/components/layout/PreviewGuard";
import { accentDeclarations } from "@/lib/brand-colors";
import { getStoreSettings } from "@/lib/data/catalog";
import { getPreviewDraft } from "@/lib/data/preview";
import { getCurrentUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { nounsOf, storeNameOf } from "@/lib/storefront";
import { parseTheme, themeCookie } from "@/lib/theme";
import { storeThemes } from "@/lib/themes";
import { fontVariables } from "./fonts";

// Each page sets its own title, shown with the store's name from Theme and brand: "Oil Paint Set · Palettehub".
// The store's logo is the browser tab's icon too.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const storeName = storeNameOf(settings);
  const logo = settings?.storefront.logoUrl;
  return {
    metadataBase: siteUrl,
    title: { default: storeName, template: `%s · ${storeName}` },
    description: settings?.storefront.description ?? settings?.storefront.tagline ?? undefined,
    icons: logo ? { icon: logo } : undefined,
  };
}

// The one document every page shares: the storefront, the account pages, sign-in and the admin. Each
// group's own layout adds its navigation. Who is signed in is read once here and shared with client components.
// A visitor who picked light or dark gets it on <html>; without a choice the page follows their device.
// The store's theme and accent color are set here too; the console ignores both (globals.css).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore, settings, draft] = await Promise.all([getCurrentUser(), cookies(), getStoreSettings(), getPreviewDraft()]);
  const theme = draft?.mode ?? parseTheme(cookieStore.get(themeCookie)?.value);
  const storeTheme = settings?.storefront.theme ?? "night_studio";
  const accentColor = settings?.storefront.accentColor;
  // Only hex colors and numbers go into it (lib/brand-colors.ts). The doubled attribute outranks a theme's own accent.
  const accent = accentColor ? accentDeclarations(accentColor, storeThemes[storeTheme].surfaces) : "";
  const brand = { name: storeNameOf(settings), logoUrl: settings?.storefront.logoUrl ?? null, ...nounsOf(settings) };

  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme={theme}
      data-store-theme={storeTheme === "night_studio" ? undefined : storeTheme}
      data-store-accent={accent ? "" : undefined}
    >
      <head>
        {accent ? <style dangerouslySetInnerHTML={{ __html: `:root[data-store-accent][data-store-accent]:not(:has([data-console])){${accent}}` }} /> : null}
      </head>
      <body className="flex min-h-screen flex-col">
        <CurrentUserProvider user={user}>
          <StoreBrandProvider brand={brand}>
            {children}
            <Toaster />
          </StoreBrandProvider>
        </CurrentUserProvider>
        {draft && <PreviewGuard />}
      </body>
    </html>
  );
}
