"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Category } from "@/lib/api/types";
import type { ProductFilters as Filters } from "@/lib/product-filters";
import { ProductFilters } from "./ProductFilters";

// On phones the filters open in a drawer from the bottom; "Show results" applies them and closes it
export function MobileFilters({ categories, filters, activeCount }: { categories: Category[]; filters: Filters; activeCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal aria-hidden />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">Narrow the list by category, availability and price.</SheetDescription>
        </SheetHeader>
        <div className="px-5 py-6">
          <ProductFilters
            categories={categories}
            filters={filters}
            idPrefix="sheet"
            footer={
              <Button type="submit" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Show results
              </Button>
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
