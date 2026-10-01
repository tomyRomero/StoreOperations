"use client"

import { CircleAlert, CircleCheck, Info } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

// Each kind of toast has its own icon, so it never relies on color alone
const icons = {
  default: <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />,
  success: <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />,
  destructive: <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {icons[variant ?? "default"]}
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
