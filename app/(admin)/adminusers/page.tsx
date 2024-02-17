
import UsersTable from "@/components/tables/UsersTable"
import { fetchUsers } from "@/lib/actions/admin.actions";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/forms/SearchBar";

export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  const searchString = searchParams.q; //search string
  const pageNumber = searchParams.page ? + searchParams.page : 1; //page number
  const pageSize = 7; 
  const sortBy = "desc"; 

  const { users, isNext } = await fetchUsers({
    searchString,
    pageNumber,
    pageSize,
    sortBy,
  });

  const createPaginationPath = ()=> {
    // Create a new URLSearchParams object
   const params = new URLSearchParams();  

   //Add the search parameter to the URLSearchParams
   params.append('q', searchParams.q ? searchParams.q || searchParams.q : "");

   // Get the final query string
   const queryString = params.toString();

   //include the queryString in pagination
   return `/adminusers?${queryString}&`
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 flex flex-col h-full">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-6">
      <h1 className="text-heading3-bold">Users</h1>
        <div className="grid grid-cols-1">
        <SearchBar routeType="adminusers" placeholder={"Search for Users by Username, Email, or ID"}/>
        </div>
        <div className="grid grid-cols-1 border shadow-sm rounded-lg overflow-x-hidden">
            <UsersTable users={users}/>
        </div>
      </main>
      <Pagination
          path={createPaginationPath()}
          pageNumber={searchParams?.page ? + searchParams.page : 1}
          isNext={isNext}
        />
    </section>
  )
}

