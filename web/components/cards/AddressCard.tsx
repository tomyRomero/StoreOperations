"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { api } from '@/lib/api/browser';
import { problemMessage } from '@/lib/api/problems';
import type { Address } from '@/lib/api/types';
import { addressLines } from '@/lib/format';

// The address book: the default first. Changes go to the API, then the page reloads its data.
const AddressCard = ({ addresses }: { addresses: Address[] }) => {
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
    toast({ title: done });
    router.refresh();
  };

  const remove = (address: Address) => {
    if (!window.confirm(`Delete the address for ${address.recipientName} at ${address.line1}?`)) return;
    void run(address.id, () => api.DELETE("/api/account/addresses/{id}", { params: { path: { id: address.id } } }), "Address deleted");
  };

  const makeDefault = (address: Address) =>
    run(address.id, () => api.POST("/api/account/addresses/{id}/default", { params: { path: { id: address.id } } }), "Default address updated");

  return (
    <CardContent>
      <ul className="flex flex-col divide-y">
        {addresses.map((address) => (
          <li className="flex items-start gap-4 py-4" key={address.id}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-medium">
                {address.recipientName}
                {address.isDefault && <Badge variant="accent">Default</Badge>}
              </div>
              {addressLines(address).map((line) => <div key={line}>{line}</div>)}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {!address.isDefault && (
                <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => makeDefault(address)}>
                  Make default
                </Button>
              )}
              <Button size="icon" variant="outline" disabled={busyId !== null} onClick={() => remove(address)}>
                <Image src="/assets/delete.png" alt="" width={24} height={24} />
                <span className="sr-only">Delete the address for {address.recipientName}</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  );
};

export default AddressCard;
