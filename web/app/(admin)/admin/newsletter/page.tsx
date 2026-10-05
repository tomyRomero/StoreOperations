import type { Metadata } from "next";
import { MailX, SearchX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListSearch } from "@/components/admin/list/ListSearch";
import { NewsletterForm } from "@/components/admin/newsletter/NewsletterForm";
import { SubscribersTable } from "@/components/admin/newsletter/SubscribersTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Pagination } from "@/components/ui/pagination";
import { pageNumber } from "@/lib/admin-lists";
import { getAdminSettings, getSubscribers, subscribersPageSize } from "@/lib/data/admin-store";
import { firstValue, type SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Newsletter" };

const path = "/admin/newsletter";

export default async function NewsletterPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const search = firstValue(params.q)?.trim() ?? "";
  const page = pageNumber(params.page);

  // The send button counts everyone, whatever the search shows
  const [subscribers, everyone, settings] = await Promise.all([
    getSubscribers({ search, page }),
    search ? getSubscribers({}) : null,
    getAdminSettings(),
  ]);
  const total = (search ? everyone : subscribers)?.totalCount ?? 0;

  return (
    <>
      <AdminPageHeader title="Newsletter" description={`${total} ${total === 1 ? "person is" : "people are"} subscribed.`} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="write-heading" className="self-start rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="write-heading" className="mb-5 text-h4">
            Write a newsletter
          </h2>
          <NewsletterForm subscriberCount={total} />
        </section>

        <section aria-labelledby="subscribers-heading" className="grid content-start gap-3">
          <h2 id="subscribers-heading" className="text-h4">
            Subscribers
          </h2>
          <ListSearch label="Search subscribers by email" className="sm:max-w-none" />
          {!subscribers || !settings ? (
            <ErrorState title="We couldn't load the subscribers" action={<RetryButton />} />
          ) : subscribers.items.length === 0 ? (
            search ? (
              <EmptyState icon={SearchX} title="No subscribers match" className="bg-card" />
            ) : (
              <EmptyState icon={MailX} title="No subscribers yet" className="bg-card">
                People join from the sign-up box in the store&apos;s footer.
              </EmptyState>
            )
          ) : (
            <>
              <SubscribersTable subscribers={subscribers.items} timeZone={settings.timeZoneId} />
              <Pagination
                pathname={path}
                searchParams={params}
                page={subscribers.page}
                totalPages={subscribers.totalPages}
                totalCount={subscribers.totalCount}
                pageSize={subscribersPageSize}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
