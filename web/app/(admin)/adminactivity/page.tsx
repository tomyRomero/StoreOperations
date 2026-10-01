import Link from "next/link";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import ActivityCard from "@/components/cards/ActivityCard";
import Pagination from "@/components/shared/Pagination";
import type { ActivityEntity } from "@/lib/api/types";
import { getStoreSettings } from "@/lib/data/catalog";
import { getActivity } from "@/lib/data/admin-store";

const tabs: { entity?: ActivityEntity; label: string }[] = [
  { label: "Everything" },
  { entity: "order", label: "Orders" },
  { entity: "product", label: "Products" },
  { entity: "category", label: "Categories" },
  { entity: "user", label: "Accounts" },
  { entity: "newsletter_subscriber", label: "Newsletter" },
  { entity: "store_settings", label: "Settings" },
];

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const entity = tabs.find((t) => t.entity !== undefined && t.entity === searchParams.type)?.entity;
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const [activity, settings] = await Promise.all([getActivity({ entityType: entity, page: pageNumber }), getStoreSettings()]);
  const now = new Date();

  const pathFor = (next?: ActivityEntity) => (next ? `/adminactivity?type=${next}` : "/adminactivity?");

  return (
      <section className="md:pt-24 max-sm:pt-20 lg:pt-0">
        <div className="grid grid-cols-1 max-w-3xl mx-auto gap-4">
          <Card>
            <CardHeader className="gap-4">
              <CardTitle className="text-heading4-bold">Recent Activity</CardTitle>
              <nav aria-label="Filter activity" className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.label}
                    href={pathFor(tab.entity)}
                    aria-current={tab.entity === entity ? "page" : undefined}
                    className={`rounded-full border px-3 py-1 text-sm ${tab.entity === entity ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </CardHeader>
            <CardContent>
              {!activity || !settings ? (
                <p className="text-center py-4 text-red-600">Failed to load recent activity. Please try again later.</p>
              ) : activity.totalCount === 0 ? (
                <p className="text-center py-4">Nothing here yet.</p>
              ) : (
                <ul className="divide-y">
                  {activity.items.map((entry) => (
                    <ActivityCard key={entry.id} entry={entry} timeZone={settings.timeZoneId} now={now} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {activity && (
          <Pagination
            path={entity ? `${pathFor(entity)}&` : pathFor()}
            pageNumber={activity.page}
            isNext={activity.page < activity.totalPages}
          />
        )}
      </section>
  );
};

export default Page;
