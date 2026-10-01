import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Small labels for stock, order status and roles. Status colors always come with words, never alone.
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-foreground",
        solid: "bg-primary text-primary-foreground",
        outline: "border border-input text-foreground",
        accent: "bg-accent-subtle text-accent-ink",
        sale: "bg-sale-subtle text-sale",
        success: "bg-success-subtle text-success",
        warning: "bg-warning-subtle text-warning",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
