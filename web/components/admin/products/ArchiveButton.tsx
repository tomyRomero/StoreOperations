"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { AdminProduct } from "@/lib/api/types";

// Products are archived rather than deleted, so past orders keep their links. Archiving takes the
// product out of the store (and out of carts); restoring puts it back.
export function ArchiveButton({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const archived = product.archivedAtUtc !== null;

  const change = async () => {
    setBusy(true);
    const path = { params: { path: { id: product.id } } };
    const { error, response } = archived
      ? await api.POST("/api/admin/products/{id}/restore", path)
      : await api.POST("/api/admin/products/{id}/archive", path);
    setBusy(false);

    if (!response.ok) {
      toast({ variant: "destructive", title: archived ? "Couldn't restore the product" : "Couldn't archive the product", description: problemMessage(error) });
      return;
    }
    toast({ variant: "success", title: archived ? `${product.name} is back in the store` : `${product.name} archived` });
    router.refresh();
  };

  if (archived) {
    return (
      <Button variant="outline" loading={busy} onClick={() => void change()}>
        <ArchiveRestore aria-hidden />
        Restore to the store
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" loading={busy}>
          <Archive aria-hidden />
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            It leaves the store and customers&apos; carts. Past orders keep it, and you can restore it here at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it in the store</AlertDialogCancel>
          <AlertDialogAction onClick={() => void change()}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
