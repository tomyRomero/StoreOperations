"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { api } from '@/lib/api/browser';
import { problemMessage } from '@/lib/api/problems';
import type { Subscriber } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

// One page of subscribers. Removing someone deletes their address: the store keeps no list of who left.
const NewsletterSubscribers = ({ subscribers, timeZone }: { subscribers: Subscriber[]; timeZone: string }) => {
  const [busyId, setBusyId] = useState<number | null>(null);
  const router = useRouter();

  const remove = async (subscriber: Subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the newsletter? They won't get any more newsletters.`)) return;

    setBusyId(subscriber.id);
    const { error, response } = await api.POST("/api/admin/newsletter/subscribers/remove", { body: { ids: [subscriber.id] } });
    setBusyId(null);

    if (!response.ok) {
      toast({ title: "Couldn't remove the subscriber", description: problemMessage(error), variant: "destructive" });
      return;
    }
    toast({ title: `${subscriber.email} removed` });
    router.refresh();
  };

  return (
    <ul className="divide-y divide-gray-200">
      {subscribers.map((subscriber) => (
        <li key={subscriber.id} className="flex items-center gap-4 py-2">
          <span className="min-w-0 truncate">{subscriber.email}</span>
          <span className="ml-auto whitespace-nowrap text-sm text-gray-500">since {formatDate(subscriber.subscribedAtUtc, timeZone)}</span>
          <Button variant="ghost" size="icon" disabled={busyId !== null} onClick={() => remove(subscriber)}>
            <Image src="/assets/delete.png" alt="" width={24} height={24} />
            <span className="sr-only">Remove {subscriber.email}</span>
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default NewsletterSubscribers;
