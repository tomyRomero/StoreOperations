import * as React from "react"

import { cn } from "@/lib/utils"

// Size, corners and text come from the --field-* tokens: roomy on the storefront, compact in the console.
// 16px text on phones, so iOS doesn't zoom in when the field is focused.
const fieldClasses =
  "w-full rounded-field border border-input bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive md:text-(length:--field-text)"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        fieldClasses,
        "h-(--field-height) py-2 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Input, fieldClasses }
