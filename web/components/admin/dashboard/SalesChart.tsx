"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyRevenue } from "@/lib/api/types";
import { labelIndexes, niceTicks } from "@/lib/dashboard";
import { formatMoney, formatMoneyShort } from "@/lib/money";

const height = 240;
const margin = { top: 12, right: 16, bottom: 28, left: 52 };
const shortDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const longDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const day = (date: string) => new Date(`${date}T00:00:00Z`);

function readout(point: DailyRevenue) {
  return `${longDay.format(day(point.date))}: ${formatMoney(point.revenueCents)} from ${point.orders} order${point.orders === 1 ? "" : "s"}`;
}

// Sales per day as a line with a soft fill. The crosshair snaps to the nearest day under the pointer,
// and the arrow keys step through the days for keyboard and screen reader users. Every value is also
// in the table below the chart, so nothing depends on hovering.
export function SalesChart({ days }: { days: DailyRevenue[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  // Drawn in real pixels at the card's width, so lines and text never stretch
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const n = days.length;
  const ticks = niceTicks(Math.max(...days.map((d) => d.revenueCents), 0));
  const top = ticks.length > 1 ? ticks[ticks.length - 1] : 1;
  const plotWidth = Math.max(width - margin.left - margin.right, 0);
  const plotHeight = height - margin.top - margin.bottom;
  const x = (i: number) => margin.left + (n > 1 ? (i * plotWidth) / (n - 1) : plotWidth / 2);
  const y = (cents: number) => margin.top + plotHeight - (cents / top) * plotHeight;
  const baseline = margin.top + plotHeight;

  const line = days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.revenueCents)}`).join("");
  const area = n > 0 ? `${line}L${x(n - 1)},${baseline}L${x(0)},${baseline}Z` : "";
  const labels = labelIndexes(n, Math.max(2, Math.floor(plotWidth / 64)));

  const nearest = (clientX: number) => {
    const left = frame.current?.getBoundingClientRect().left ?? 0;
    const i = n > 1 ? Math.round(((clientX - left - margin.left) / plotWidth) * (n - 1)) : 0;
    return Math.min(Math.max(i, 0), n - 1);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const current = active ?? n - 1;
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: n - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(Math.min(Math.max(next, 0), n - 1));
  };

  const point = active === null ? null : days[active];
  const flip = active !== null && x(active) > width * 0.6;

  return (
    <div
      ref={frame}
      tabIndex={0}
      role="group"
      aria-label="Sales per day. Use the left and right arrow keys to read each day."
      onKeyDown={onKeyDown}
      onFocus={() => setActive((current) => current ?? n - 1)}
      onBlur={() => setActive(null)}
      onPointerMove={(event) => setActive(nearest(event.clientX))}
      onPointerLeave={() => setActive(null)}
      className="relative touch-pan-y rounded-sm"
      style={{ height }}
    >
      {width > 0 && n > 0 && (
        <svg width={width} height={height} aria-hidden className="block overflow-visible">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} className="stroke-border" strokeWidth={1} />
              <text x={margin.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-xs tabular-nums">
                {formatMoneyShort(tick)}
              </text>
            </g>
          ))}
          {labels.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"}
              className="fill-muted-foreground text-xs"
            >
              {shortDay.format(day(days[i].date))}
            </text>
          ))}
          <path d={area} className="fill-accent" fillOpacity={0.1} />
          <path d={line} className="stroke-accent" fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={margin.top} y2={baseline} className="stroke-foreground/40" strokeWidth={1} />
              <circle cx={x(active)} cy={y(days[active].revenueCents)} r={5} className="fill-accent stroke-card" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}

      {point && active !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-10 grid gap-0.5 rounded-xl border bg-card px-3 py-2 text-sm whitespace-nowrap shadow-md"
          style={{ left: x(active), transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)" }}
        >
          <span className="font-semibold">{formatMoney(point.revenueCents)}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-3 rounded-full bg-accent" />
            {longDay.format(day(point.date))} · {point.orders} order{point.orders === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {/* What the crosshair shows, read out as the arrow keys move it */}
      <p className="sr-only" aria-live="polite">
        {point ? readout(point) : ""}
      </p>
    </div>
  );
}
