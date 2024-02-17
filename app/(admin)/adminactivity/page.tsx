
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import ActivityCard from "@/components/cards/ActivityCard"
import { getAllActivity } from "@/lib/actions/store.actions"
import Pagination from "@/components/shared/Pagination";


const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
})=>  {

  //Get Activity Pagination Results
  const results = await getAllActivity(
    searchParams.page ? + searchParams.page : 1,
     5, 
  )


  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
       <div className="grid grid-cols-1  max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex items-center gap-4">
            <CardTitle className="text-heading4-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="mx-auto">
              <div className="flex items-center gap-4 max-xxs:mx-auto w-full]">
                <div className="border-b border-gray-300 w-full"></div>
            </div>
            {results.activities.map((activity: any, index) => (
              <ActivityCard key={index} action={activity.action} details={activity.details} timestamp={activity.timestamp}/>
            ))}
          </CardContent>
        </Card>
        </div>
        <Pagination
          path={"/adminactivity?"}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={results.isNext}
        />
    </section>
  )
}

export default page;