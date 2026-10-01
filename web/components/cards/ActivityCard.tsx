import React from 'react'
import Link from 'next/link'
import type { ActivityEntry } from '@/lib/api/types'
import { describeActivity } from '@/lib/activity'
import { calculateTimeAgo } from '@/lib/utils'
import { formatDate } from '@/lib/format'

const ActivityCard = ({ entry, timeZone, now }: { entry: ActivityEntry; timeZone: string; now: Date }) => {
  const { text, href } = describeActivity(entry)

  return (
    <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
      <span className="font-medium">{href ? <Link className="hover:underline" href={href}>{text}</Link> : text}</span>
      <time className="ml-auto text-sm text-gray-500" dateTime={entry.occurredAtUtc} title={formatDate(entry.occurredAtUtc, timeZone)}>
        {calculateTimeAgo(now, entry.occurredAtUtc)}
      </time>
    </li>
  )
}

export default ActivityCard
