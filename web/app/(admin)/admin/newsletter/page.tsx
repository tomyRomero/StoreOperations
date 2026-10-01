import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import NewsletterSubscribers from "@/components/cards/NewsletterSubscribers";
import NewsletterForm from "@/components/forms/NewsletterForm";
import SearchBar from "@/components/forms/SearchBar";
import Pagination from "@/components/shared/Pagination";
import { getStoreSettings } from "@/lib/data/catalog";
import { getSubscribers } from "@/lib/data/admin-store";

const page = async (props: { searchParams: Promise<{ [key: string]: string | undefined }> }) => {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? "";
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  // The total for the send button counts everyone, whatever the search shows
  const [subscribers, everyone, settings] = await Promise.all([
    getSubscribers({ search, page: pageNumber }),
    search ? getSubscribers({}) : null,
    getStoreSettings(),
  ]);
  const total = (search ? everyone : subscribers)?.totalCount ?? 0;

  return (
    <section className="flex flex-col gap-6 h-full">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-heading3-bold">Subscribers</CardTitle>
          <CardDescription>{total} subscribed to the newsletter.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SearchBar placeholder="Search subscribers by email" />
          {!subscribers || !settings ? (
            <p className="text-red-600">Couldn&apos;t load subscribers. Please try again.</p>
          ) : subscribers.totalCount === 0 ? (
            <p>{search ? "No subscribers match." : "No subscribers yet."}</p>
          ) : (
            <NewsletterSubscribers subscribers={subscribers.items} timeZone={settings.timeZoneId} />
          )}
          {subscribers && (
            <Pagination
              path={`/admin/newsletter?${search ? `q=${encodeURIComponent(search)}&` : ""}`}
              pageNumber={subscribers.page}
              isNext={subscribers.page < subscribers.totalPages}
            />
          )}
        </CardContent>
      </Card>

      <NewsletterForm subscriberCount={total} />
    </section>
  )
}

export default page;
