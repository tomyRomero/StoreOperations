"use client";

import { useRouter, usePathname } from "next/navigation";

import { Button } from "../ui/button";
import { useAppContext } from "@/lib/AppContext";


interface Props {
  path: string
  pageNumber: number;
  isNext: boolean;
}

function Pagination({ pageNumber, isNext, path}: Props) {
  const router = useRouter();
  const currentPath = usePathname()

  const {pageChanged, setPageChanged} = useAppContext()

  const handleNavigation = (type: string) => {
    
    //Let global state know that a page has changed
    setPageChanged(!pageChanged)

    let nextPageNumber = pageNumber;

    if (type === "prev") {
      nextPageNumber = Math.max(1, pageNumber - 1);
    } else if (type === "next") {
      nextPageNumber = pageNumber + 1;
    }

    const nextPagePath = `${path}page=${nextPageNumber}`
   
    if (nextPageNumber > 1) {
      router.push(nextPagePath);
    } else {
      router.push(`${currentPath.split("?")[0]}`);
    }
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className='pagination'>
      <Button
        onClick={() => handleNavigation("prev")}
        disabled={pageNumber === 1}
        className='!text-small-regular text-light-2 bg-black'
      >
        Prev
      </Button>
      <p className='text-small-semibold text-black'>{pageNumber}</p>
      <Button
        onClick={() => handleNavigation("next")}
        disabled={!isNext}
        className='!text-small-regular text-light-2 bg-black'
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;