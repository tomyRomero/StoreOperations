"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { Address } from "@/lib/api/types";
import { addressLines } from "@/lib/format";

// The address book, default first. Deleting asks first; changes go to the API, then the page reloads its data.
export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = async (id: number, action: () => Promise<{ error?: unknown; response: Response }>, done: string) => {
    setBusyId(id);
    const { error, response } = await action();
    setBusyId(null);

    if (!response.ok) {
      toast({ title: "Couldn't update your addresses", description: problemMessage(error), variant: "destructive" });
      return;
    }
    toast({ variant: "success", title: done });
    router.refresh();
  };

  const remove = (address: Address) =>
    run(address.id, () => api.DELETE("/api/account/addresses/{id}", { params: { path: { id: address.id } } }), "Address deleted");

  const makeDefault = (address: Address) =>
    run(address.id, () => api.POST("/api/account/addresses/{id}/default", { params: { path: { id: address.id } } }), "Default address updated");

  const ordered = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {ordered.map((address) => (
        <li key={address.id} className="flex flex-col gap-4 rounded-md border p-5">
          <div className="grid gap-0.5 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              {address.recipientName}
              {address.isDefault && <Badge variant="accent">Default</Badge>}
            </p>
            {addressLines(address).map((line) => (
              <p key={line} className="text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            {!address.isDefault && (
              <Button size="sm" variant="outline" loading={busyId === address.id} disabled={busyId !== null} onClick={() => makeDefault(address)}>
                Make default
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-sale hover:bg-sale-subtle" disabled={busyId !== null}>
                  Delete<span className="sr-only"> the address for {address.recipientName}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this address?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {address.recipientName}, {address.line1}, {address.city}. Past orders keep the address they shipped to.
                    {address.isDefault && " Your newest other address becomes the default."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={() => void remove(address)}>
                    Delete address
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </li>
      ))}
    </ul>
  );
}
