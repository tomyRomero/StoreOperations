"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import { FormAlert } from "./FormAlert";

// Leaves the newsletter only when the visitor presses the button: link scanners open the email's
// links (and some run their scripts), and must never unsubscribe anyone by doing so.
const UnsubscribeButton = ({ token }: { token: string }) => {
  const [state, setState] = useState<"ready" | "sending" | "done">("ready");
  const [problem, setProblem] = useState<string | null>(null);

  const unsubscribe = async () => {
    setState("sending");
    setProblem(null);
    const { error, response } = await api.POST("/api/newsletter/unsubscribe/{token}", { params: { path: { token } } });
    if (!response.ok) {
      setState("ready");
      setProblem(problemMessage(error));
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="grid justify-items-center gap-4" role="status">
        <p className="flex items-center gap-2 font-semibold">
          <CircleCheck className="size-5 text-success" aria-hidden />
          You&apos;re unsubscribed
        </p>
        <p className="text-muted-foreground">You won&apos;t get any more newsletters from us.</p>
        <Button asChild variant="outline">
          <Link href="/products">Keep shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid justify-items-center gap-4">
      {problem && <FormAlert>{problem}</FormAlert>}
      <Button size="lg" onClick={unsubscribe} loading={state === "sending"}>
        Unsubscribe
      </Button>
    </div>
  );
};

export default UnsubscribeButton;
