import type { Metadata } from "next";
import AdminNav from "@/components/nav/AdminNav";
import AdminDashboard from "@/components/nav/AdminDashboard";
import MobileAdminDashboard from "@/components/nav/MobileAdminDashboard";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "PaletteHub Admin",
  description: "Admin Panel for Online Store Operations Manager App with Admin Dashboard",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fail closed: only a user the API confirms as admin gets in. The API also refuses every admin
  // request from anyone else, so this only spares them a broken page.
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNav />
      <div className="max-xxs:pt-16 pt-20 md:pt-24 lg:pt-32 grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminDashboard />
        <div className="flex flex-col">
          <MobileAdminDashboard />
          <main className="flex flex-1 p-4 flex-col max-xxs:pt-16 md:pt-6 sm:pt-20 lg:pt-4">
            <section>{children}</section>
          </main>
        </div>
      </div>
    </div>
  );
}
