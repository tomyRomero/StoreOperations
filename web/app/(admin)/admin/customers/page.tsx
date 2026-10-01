import Link from "next/link";
import UsersTable from "@/components/tables/UsersTable";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/forms/SearchBar";
import type { AccountRole } from "@/lib/api/types";
import { getAdminCustomers } from "@/lib/data/admin-customers";
import { getStoreSettings } from "@/lib/data/catalog";

const tabs: { role?: AccountRole; label: string }[] = [
  { label: "Everyone" },
  { role: "customer", label: "Customers" },
  { role: "admin", label: "Admins" },
];

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? "";
  const role = tabs.find((t) => t.role !== undefined && t.role === searchParams.role)?.role;
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const [users, settings] = await Promise.all([getAdminCustomers({ search, role, page: pageNumber }), getStoreSettings()]);

  // Keeps the search and the tab while paging or switching tabs
  const pathWith = (next?: AccountRole) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (next) params.set("role", next);
    return `/admin/customers?${params.toString()}`;
  };

  return (
      <section className="flex flex-col h-full">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-6">
          <h1 className="text-heading3-bold">Users</h1>
          <SearchBar placeholder="Search by username, email or id" />
          <nav aria-label="Filter by role" className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={pathWith(tab.role)}
                aria-current={tab.role === role ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm ${tab.role === role ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-1 border shadow-xs rounded-lg overflow-x-auto">
            {!users || !settings ? (
              <p className="p-10 text-center text-red-600">Failed to load users. Please try again later.</p>
            ) : users.totalCount === 0 ? (
              <p className="p-10">No accounts match.</p>
            ) : (
              <UsersTable users={users.items} timeZone={settings.timeZoneId} />
            )}
          </div>
        </main>

        {users && (
          <Pagination
            path={`${pathWith(role)}&`}
            pageNumber={users.page}
            isNext={users.page < users.totalPages}
          />
        )}
      </section>
  );
}
