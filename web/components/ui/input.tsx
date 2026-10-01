import * as React from "react"

import { cn } from "@/lib/utils"

// 16px text on phones, so iOS doesn't zoom in when the field is focused
const fieldClasses =
  "w-full rounded-sm border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive md:text-sm"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        fieldClasses,
        "h-10 py-2 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Input, fieldClasses }
