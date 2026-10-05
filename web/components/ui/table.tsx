import * as React from "react";

import { cn } from "@/lib/utils";

// Below 1280px a wide table scrolls sideways inside its own box, so the page itself never does. From
// 1280px every console table fits, and without that box the header row can stay in view (TableHeader).
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full max-xl:overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  // Stays under the console's top bar (h-14) while the rows scroll. A card around the table clips with
  // overflow-clip (and min-w-0, so it can still shrink), not overflow-hidden, which would hold the header
  // inside the card.
  return <thead className={cn("bg-muted xl:sticky xl:top-14 xl:z-10 [&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot className={cn("border-t bg-muted font-semibold [&>tr]:last:border-b-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b transition-colors duration-[120ms] hover:bg-muted/50 data-[state=selected]:bg-accent-subtle",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
