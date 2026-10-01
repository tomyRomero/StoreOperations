"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/button"
import { api } from "@/lib/api/browser"
import { problemMessage } from "@/lib/api/problems"

// Leaves the newsletter only when the visitor presses the button: link scanners open the email's
// links (and some run their scripts), and must never unsubscribe anyone by doing so.
const UnsubscribeButton = ({ token }: { token: string }) => {
  const [state, setState] = useState<"ready" | "sending" | "done">("ready")
  const [problem, setProblem] = useState<string | null>(null)

  const unsubscribe = async () => {
    setState("sending")
    setProblem(null)
    const { error, response } = await api.POST("/api/newsletter/unsubscribe/{token}", { params: { path: { token } } })
    if (!response.ok) {
      setState("ready")
      setProblem(problemMessage(error))
      return
    }
    setState("done")
  }

  if (state === "done") {
    return (
      <div className="grid gap-4 justify-items-center" role="status">
        <p>You&apos;re unsubscribed. You won&apos;t get any more newsletters from us.</p>
        <Button asChild variant="outline"><Link href="/products">Keep shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 justify-items-center">
      <Button onClick={unsubscribe} disabled={state === "sending"}>
        {state === "sending" ? "Unsubscribing..." : "Unsubscribe"}
      </Button>
      {problem && <p className="text-red-500" role="alert">{problem}</p>}
    </div>
  )
}

export default UnsubscribeButton
