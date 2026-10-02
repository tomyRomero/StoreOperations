import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterTabs } from "@/components/admin/list/FilterTabs";
import { ListSearch } from "@/components/admin/list/ListSearch";
import { SortableHead } from "@/components/admin/list/SortableHead";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AccountRole, AdminCustomerSort } from "@/lib/api/types";
import { listHref, nextSort, oneOf, pageNumber, withParams } from "@/lib/admin-lists";
import { adminCustomersPageSize, getAdminCustomers } from "@/lib/data/admin-customers";
import { getAdminSettings } from "@/lib/data/admin-store";
import { formatDate } from "@/lib/format";
import { firstValue, type SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Customers" };

const path = "/admin/customers";
const tabs: { role?: AccountRole; label: string }[] = [{ label: "Everyone" }, { role: "customer", label: "Customers" }, { role: "admin", label: "Admins" }];
const sorts: AdminCustomerSort[] = ["joined", "joined_desc", "username", "username_desc"];

export default async function CustomersPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const search = firstValue(params.q)?.trim() ?? "";
  const role = oneOf(params.role, ["customer", "admin"] as const);
  const sort = oneOf(params.sort, sorts);
  const page = pageNumber(params.page);

  const [customers, settings] = await Promise.all([getAdminCustomers({ search, role, sort, page }), getAdminSettings()]);

  const href = (changes: Record<string, string | undefined>) => listHref(path, withParams(params, changes));
  const sortHref = (column: string, firstDescending: boolean) => {
    const next = nextSort(sort ?? "joined_desc", column, firstDescending);
    return href({ sort: next === "joined_desc" ? undefined : next });
  };
  const filtered = Boolean(search || role);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description={customers ? `${customers.totalCount} ${customers.totalCount === 1 ? "account" : "accounts"}${filtered ? " match" : ""}` : undefined}
      />
      <div className="mb-4 grid gap-3">
        <ListSearch label="Search by username, email or id" />
        <FilterTabs label="Filter by role" tabs={tabs.map((tab) => ({ label: tab.label, href: href({ role: tab.role }), current: tab.role === role }))} />
      </div>

      {!customers || !settings ? (
        <ErrorState title="We couldn't load the accounts" action={<RetryButton />} />
      ) : customers.items.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="No accounts match"
            className="bg-card"
            action={
              <Button asChild variant="outline">
                <Link href={path}>Show everyone</Link>
              </Button>
            }
          >
            Try another search or role.
          </EmptyState>
        ) : (
          <EmptyState icon={Users} title="No accounts yet" className="bg-card">
            Customers appear here when they sign up.
          </EmptyState>
        )
      ) : (
        <div className="grid gap-4">
          <div className="min-w-0 overflow-clip rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Account" column="username" sort={sort ?? "joined_desc"} href={sortHref("username", false)} />
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <SortableHead label="Joined" column="joined" sort={sort ?? "joined_desc"} href={sortHref("joined", true)} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.items.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="max-w-72">
                      <Link href={`/admin/customers/${customer.id}`} className="block truncate font-semibold hover:underline">
                        {customer.username}
                      </Link>
                      <p className="truncate text-muted-foreground">{customer.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-wrap gap-1">
                        <Badge variant={customer.isAdmin ? "accent" : "neutral"}>{customer.isAdmin ? "Admin" : "Customer"}</Badge>
                        {customer.isDisabled && <Badge variant="sale">Disabled</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{customer.orderCount}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(customer.joinedAtUtc, settings.timeZoneId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            pathname={path}
            searchParams={params}
            page={customers.page}
            totalPages={customers.totalPages}
            totalCount={customers.totalCount}
            pageSize={adminCustomersPageSize}
          />
        </div>
      )}
    </>
  );
}
