import type { Metadata } from "next";
import Link from "next/link";
import { Activity, LayoutGrid, Mail, Package, Settings, ShoppingBag, User, type LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterTabs } from "@/components/admin/list/FilterTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Pagination } from "@/components/ui/pagination";
import type { ActivityEntity } from "@/lib/api/types";
import { describeActivity, groupByDay } from "@/lib/activity";
import { listHref, oneOf, pageNumber, withParams } from "@/lib/admin-lists";
import { activityPageSize, getActivity, getAdminSettings } from "@/lib/data/admin-store";
import { formatDate, formatTimeAgo } from "@/lib/format";
import type { SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Activity" };

const path = "/admin/activity";
const tabs: { entity?: ActivityEntity; label: string }[] = [
  { label: "Everything" },
  { entity: "order", label: "Orders" },
  { entity: "product", label: "Products" },
  { entity: "category", label: "Categories" },
  { entity: "user", label: "Accounts" },
  { entity: "newsletter_subscriber", label: "Newsletter" },
  { entity: "store_settings", label: "Settings" },
];
const icons: Record<ActivityEntity, LucideIcon> = {
  order: ShoppingBag,
  product: Package,
  category: LayoutGrid,
  user: User,
  newsletter_subscriber: Mail,
  store_settings: Settings,
};

export default async function ActivityPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const entity = oneOf(params.type, tabs.flatMap((t) => (t.entity ? [t.entity] : [])));
  const page = pageNumber(params.page);
  const [activity, settings] = await Promise.all([getActivity({ entityType: entity, page }), getAdminSettings()]);
  const now = new Date();

  return (
    <>
      <AdminPageHeader title="Activity" description="Everything customers and admins did in the store, newest first." />
      <div className="mb-4">
        <FilterTabs
          label="Filter activity"
          tabs={tabs.map((tab) => ({ label: tab.label, href: listHref(path, withParams(params, { type: tab.entity })), current: tab.entity === entity }))}
        />
      </div>

      {!activity || !settings ? (
        <ErrorState title="We couldn't load the activity" action={<RetryButton />} />
      ) : activity.items.length === 0 ? (
        <EmptyState icon={Activity} title="Nothing here yet" className="bg-card">
          Orders, sign-ups and admin changes show up here as they happen.
        </EmptyState>
      ) : (
        <div className="grid max-w-3xl gap-6">
          {groupByDay(activity.items, settings.timeZoneId, now).map((group) => (
            <section key={group.label} aria-label={group.label} className="rounded-xl border bg-card">
              <h2 className="border-b px-5 py-3 font-sans text-sm font-semibold text-muted-foreground">{group.label}</h2>
              <ul className="divide-y">
                {group.entries.map((entry) => {
                  const { text, href } = describeActivity(entry);
                  const Icon = entry.entityType ? icons[entry.entityType] : Activity;
                  return (
                    <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-4 text-muted-foreground" aria-hidden />
                      </span>
                      <p className="min-w-0 flex-1 pt-1.5 text-sm">
                        {href ? (
                          <Link href={href} className="underline-offset-4 hover:underline">
                            {text}
                          </Link>
                        ) : (
                          text
                        )}
                      </p>
                      <time dateTime={entry.occurredAtUtc} title={formatDate(entry.occurredAtUtc, settings.timeZoneId)} className="shrink-0 pt-1.5 text-sm text-muted-foreground">
                        {formatTimeAgo(entry.occurredAtUtc, now)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <Pagination
            pathname={path}
            searchParams={params}
            page={activity.page}
            totalPages={activity.totalPages}
            totalCount={activity.totalCount}
            pageSize={activityPageSize}
          />
        </div>
      )}
    </>
  );
}
