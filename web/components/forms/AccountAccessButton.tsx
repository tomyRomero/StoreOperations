"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"
import { api } from "@/lib/api/browser"
import { problemMessage } from "@/lib/api/problems"
import type { AdminCustomer } from "@/lib/api/types"

// Disabling stops sign-in and ends the customer's open sessions; enabling lets them back in.
// Admin accounts are changed on the server only, so they get no button.
const AccountAccessButton = ({ customer }: { customer: AdminCustomer }) => {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  if (customer.isAdmin) return null

  const toggle = async () => {
    if (!customer.isDisabled && !window.confirm(
      `Disable ${customer.username}? They're signed out everywhere and can't sign in until you enable the account again.`)) return

    setBusy(true)
    const path = { params: { path: { id: customer.id } } }
    const { error, response } = customer.isDisabled
      ? await api.POST("/api/admin/customers/{id}/enable", path)
      : await api.POST("/api/admin/customers/{id}/disable", path)
    setBusy(false)

    if (!response.ok) {
      toast({ title: "Couldn't change the account", description: problemMessage(error), variant: "destructive" })
      return
    }
    toast({ title: customer.isDisabled ? `${customer.username} can sign in again` : `${customer.username} is disabled` })
    router.refresh()
  }

  return (
    <Button variant={customer.isDisabled ? "default" : "destructive"} onClick={toggle} disabled={busy}>
      {customer.isDisabled ? "Enable account" : "Disable account"}
    </Button>
  )
}

export default AccountAccessButton
