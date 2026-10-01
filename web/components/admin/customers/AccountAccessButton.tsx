"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserX } from "lucide-react";
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
import type { AdminCustomer } from "@/lib/api/types";

// Disabling stops sign-in and ends the customer's open sessions; enabling lets them back in.
// Admin accounts are changed on the server only, so they get no button.
export function AccountAccessButton({ customer }: { customer: AdminCustomer }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (customer.isAdmin) return null;

  const change = async () => {
    setBusy(true);
    const path = { params: { path: { id: customer.id } } };
    const { error, response } = customer.isDisabled
      ? await api.POST("/api/admin/customers/{id}/enable", path)
      : await api.POST("/api/admin/customers/{id}/disable", path);
    setBusy(false);

    if (!response.ok) {
      toast({ variant: "destructive", title: "Couldn't change the account", description: problemMessage(error) });
      return;
    }
    toast({ variant: "success", title: customer.isDisabled ? `${customer.username} can sign in again` : `${customer.username} is disabled` });
    router.refresh();
  };

  if (customer.isDisabled) {
    return (
      <Button loading={busy} onClick={() => void change()}>
        <UserCheck aria-hidden />
        Enable account
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" loading={busy}>
          <UserX aria-hidden />
          Disable account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disable {customer.username}?</AlertDialogTitle>
          <AlertDialogDescription>
            They&apos;re signed out everywhere and can&apos;t sign in until you enable the account again. Their orders and addresses stay as they are.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it active</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void change()}>
            Disable account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
