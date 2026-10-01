"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ConsoleSidebar, type ConsoleProps } from "./ConsoleSidebar";

// The console's sidebar on phones and tablets, in a drawer from the left
export function AdminMobileNav(props: ConsoleProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Console menu">
          <Menu className="size-5!" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-surface-sunk px-3 pb-4 pt-5">
        <SheetTitle className="sr-only">Console menu</SheetTitle>
        <SheetDescription className="sr-only">The console&apos;s sections</SheetDescription>
        <ConsoleSidebar {...props} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
