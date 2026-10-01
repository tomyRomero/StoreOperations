"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { BulkBar, SelectBox, useSelection } from "@/components/admin/list/selection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { Subscriber } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

const plural = (n: number) => `${n} ${n === 1 ? "subscriber" : "subscribers"}`;

// One page of subscribers. Removing someone deletes their address: the store keeps no list of who left.
export function SubscribersTable({ subscribers, timeZone }: { subscribers: Subscriber[]; timeZone: string }) {
  const router = useRouter();
  const selection = useSelection(subscribers.map((s) => s.id));
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const chosen = subscribers.filter((s) => selection.isSelected(s.id));

  const remove = async () => {
    setWorking(true);
    const { data, error } = await api.POST("/api/admin/newsletter/subscribers/remove", { body: { ids: chosen.map((s) => s.id) } });
    setWorking(false);
    setConfirming(false);

    if (!data) {
      toast({ variant: "destructive", title: "Couldn't remove the subscribers", description: problemMessage(error) });
      return;
    }
    toast({ variant: "success", title: `${plural(data.removed)} removed` });
    selection.clear();
    router.refresh();
  };

  return (
    <div className="grid gap-3">
      <BulkBar count={selection.selected.length} noun={["subscriber", "subscribers"]} onClear={selection.clear}>
        <Button size="sm" variant="secondary" onClick={() => setConfirming(true)}>
          <Trash2 aria-hidden />
          Remove
        </Button>
      </BulkBar>

      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectBox label="Select all subscribers on this page" checked={selection.all} indeterminate={selection.some} onChange={selection.toggleAll} />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => {
              const selected = selection.isSelected(subscriber.id);
              return (
                <TableRow key={subscriber.id} data-state={selected ? "selected" : undefined}>
                  <TableCell>
                    <SelectBox label={`Select ${subscriber.email}`} checked={selected} onChange={() => selection.toggle(subscriber.id)} />
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-semibold">{subscriber.email}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(subscriber.subscribedAtUtc, timeZone)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirming} onOpenChange={(open) => !working && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {plural(chosen.length)}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="grid gap-2">
                <p>They won&apos;t get any more newsletters, and their addresses are deleted from the list.</p>
                <p className="break-words">{chosen.map((s) => s.email).join(", ")}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Keep them</AlertDialogCancel>
            <AlertDialogAction
              className="bg-sale text-white hover:bg-sale/90"
              disabled={working}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {working ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
