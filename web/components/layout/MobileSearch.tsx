"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "./HeaderSearch";

// On phones the search field opens under the header bar, already focused
export function MobileSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls="mobile-search"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="size-5!" aria-hidden /> : <Search className="size-5!" aria-hidden />}
      </Button>
      {open && (
        <div id="mobile-search" className="absolute inset-x-0 top-full border-b bg-background px-4 py-3 md:hidden">
          <HeaderSearch autoFocus onSearch={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
