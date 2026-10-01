import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

// Ink-black primary actions, a solid ink outline for secondary ones. Focus uses the site-wide ring.
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-[120ms] disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        outline: "border-[1.5px] border-foreground bg-transparent text-foreground hover:bg-muted",
        secondary: "bg-muted text-foreground hover:bg-border",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto! px-0! text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-6 text-base",
        // The storefront's main actions
        pill: "h-14 rounded-full px-7 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    // Renders its child (a Link) with the button's look instead of a <button>
    asChild?: boolean
    // Shows a spinner, keeps the button's width and blocks repeat clicks
    loading?: boolean
  }

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center gap-2 opacity-0">{children}</span>
          <LoaderCircle className="absolute animate-spin" aria-hidden />
        </>
      ) : (
        children
      )}
    </button>
  )
}

export { Button, buttonVariants }
