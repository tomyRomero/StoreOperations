"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AddressForm } from "@/components/forms/AddressForm";
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
import { cn } from "@/lib/utils";

const textButton = "text-sm font-medium transition-colors disabled:opacity-50";

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(addresses.length === 0);

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

  const saved = (done: string) => {
    setEditingId(null);
    setAdding(false);
    toast({ variant: "success", title: done });
    router.refresh();
  };

  const ordered = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return (
    <div className="grid gap-4">
      {ordered.length > 0 && (
        <ul className="grid gap-3.5 md:grid-cols-2">
          {ordered.map((address) => (
            <li key={address.id} className={cn("grid content-start gap-3.5 rounded-[24px] border bg-card p-6", editingId === address.id && "md:col-span-2")}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate font-sans text-[17px] font-semibold">{address.recipientName}</h2>
                {address.isDefault && <span className="shrink-0 rounded-full bg-accent-subtle px-2.5 py-1 font-mono text-xs font-medium text-accent-ink">Default</span>}
              </div>

              {editingId === address.id ? (
                <AddressForm address={address} submitLabel="Save changes" autoFocus onSaved={() => saved("Address updated")} onCancel={() => setEditingId(null)} />
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed text-ink-2">
                    {addressLines(address).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-foreground/8 pt-3.5">
                    {!address.isDefault && (
                      <button type="button" disabled={busyId !== null} onClick={() => void makeDefault(address)} className={cn(textButton, "font-semibold text-accent hover:underline")}>
                        {busyId === address.id ? "Saving…" : "Make default"}
                        <span className="sr-only"> for {address.recipientName}</span>
                      </button>
                    )}
                    <button type="button" disabled={busyId !== null} onClick={() => setEditingId(address.id)} className={cn(textButton, "text-ink-2 hover:text-foreground")}>
                      Edit<span className="sr-only"> the address for {address.recipientName}</span>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button" disabled={busyId !== null} className={cn(textButton, "text-muted-foreground hover:text-destructive")}>
                          Remove<span className="sr-only"> the address for {address.recipientName}</span>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this address?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {address.recipientName}, {address.line1}, {address.city}. Past orders keep the address they shipped to.
                            {address.isDefault && " Your newest other address becomes the default."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={() => void remove(address)}>
                            Remove address
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <section aria-labelledby="new-address-heading" className="grid gap-5 rounded-[28px] border bg-card p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="new-address-heading" className="font-sans text-xl font-semibold tracking-[-0.02em]">
              Add an address
            </h2>
            <p className="text-[13px] text-faint">We ship within the United States</p>
          </div>
          {ordered.length === 0 && <p className="text-muted-foreground">Save one now and checkout skips straight to payment.</p>}
          <AddressForm autoFocus={ordered.length > 0} onSaved={() => saved("Address saved")} onCancel={ordered.length > 0 ? () => setAdding(false) : undefined} />
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-foreground/20 text-[15px] font-medium text-ink-2 transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <Plus className="size-4" aria-hidden />
          Add an address
        </button>
      )}
    </div>
  );
}
