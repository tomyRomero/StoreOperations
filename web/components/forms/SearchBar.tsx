"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";

interface Props {
  placeholder: string;
}

// Searches 0.3s after typing stops. It starts from the search in the address, so a shared or reloaded
// link keeps its results, and a new search keeps the page's other filters but goes back to page 1.
function SearchBar({ placeholder }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(current);

  useEffect(() => {
    if (search === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, current, pathname, router, searchParams]);

  return (
    <div className='searchbar'>
      <Image
        src='/assets/search.png'
        alt=''
        width={24}
        height={24}
        className='object-contain'
      />
      <Input
        type='search'
        aria-label={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className='no-focus searchbar_input'
      />
    </div>
  );
}

export default SearchBar;
