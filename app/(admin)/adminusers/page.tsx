import UsersTable from "@/components/tables/UsersTable";
import { fetchUsers } from "@/lib/actions/admin.actions";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/forms/SearchBar";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const searchString = searchParams?.q || ""; // Fallback to empty string
    const pageNumber = searchParams?.page ? +searchParams.page : 1; // Fallback to page 1
    const pageSize = 7;
    const sortBy = "desc";

    const { users, isNext } = await fetchUsers({
      searchString,
      pageNumber,
      pageSize,
      sortBy,
    });

    const createPaginationPath = () => {
      const params = new URLSearchParams();

      if (searchParams.q) {
        params.append("q", searchParams.q);
      }

      return `/adminusers?${params.toString()}&`;
    };

    return (
      <section className="md:pt-24 max-sm:pt-20 lg:pt-0 flex flex-col h-full">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-6">
          <h1 className="text-heading3-bold">Users</h1>
          <div className="grid grid-cols-1">
            <SearchBar
              routeType="adminusers"
              placeholder="Search for Users by Username, Email, or ID"
            />
          </div>
          <div className="grid grid-cols-1 border shadow-sm rounded-lg overflow-x-hidden">
            <UsersTable users={users} />
          </div>
        </main>

        {users.length > 0 && (
          <Pagination
            path={createPaginationPath()}
            pageNumber={pageNumber}
            isNext={isNext}
          />
        )}
      </section>
    );
  } catch (error) {
    return (
      <section className="md:pt-24 max-sm:pt-20 lg:pt-0 flex flex-col h-full">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-6">
          <h1 className="text-heading3-bold">Users</h1>
          <div className="grid grid-cols-1">
            <SearchBar
              routeType="adminusers"
              placeholder="Search for Users by Username, Email, or ID"
            />
          </div>
          <div className="grid grid-cols-1 border shadow-sm rounded-lg overflow-x-hidden">
            <h1 className="p-10 text-center text-red-600">
              Failed to load users. Please try again later.
            </h1>
          </div>
        </main>
      </section>
    );
  }
}