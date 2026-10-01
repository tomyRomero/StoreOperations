import type { Metadata } from "next";
import { AccountNav } from "@/components/account/AccountNav";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Your account", template: "%s · Your account · Palettehub" } };

// The account area: its own menu beside (or above, on phones) each page
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");

  return (
    <div className="container grid grid-cols-1 gap-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-12">
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <div className="max-lg:hidden">
          <p className="truncate font-semibold">{user.username}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <AccountNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
