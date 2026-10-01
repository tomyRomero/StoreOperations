"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import type { AdminCategory } from "@/lib/api/types";

// Only an empty category can be deleted (the page only offers it then, and the API checks again)
export function DeleteCategoryButton({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const { error, response } = await api.DELETE("/api/admin/categories/{id}", { params: { path: { id: category.id } } });
    setBusy(false);

    if (!response.ok) {
      toast({ variant: "destructive", title: "Couldn't delete the category", description: problemMessage(error) });
      return;
    }
    toast({ variant: "success", title: `${category.name} deleted` });
    router.push("/admin/categories");
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" loading={busy}>
          <Trash2 aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the {category.name} category?</AlertDialogTitle>
          <AlertDialogDescription>It has no products, so nothing else changes. This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction className="bg-sale text-white hover:bg-sale/90" onClick={() => void remove()}>
            Delete category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
