import Link from "next/link";

export type Bar = {
  key: string | number;
  label: string;
  // Where the label leads, if anywhere
  href?: string;
  // Extra detail beside the label, such as "12 sold"
  note?: string;
  value: number;
  // The value as shown at the end of the bar
  text: string;
};

// Horizontal bars for one measure across a few named things. Every value is written at the end of its
// bar, so nothing depends on reading the bar's length or color. Bars share one color: they are one series.
export function BarList({ bars, label }: { bars: Bar[]; label: string }) {
  const max = Math.max(...bars.map((bar) => bar.value), 0);

  return (
    <ul aria-label={label} className="grid gap-1">
      {bars.map((bar) => (
        <li key={bar.key} className="grid gap-1.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-muted">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            {bar.href ? (
              <Link href={bar.href} className="min-w-0 truncate font-semibold hover:underline">
                {bar.label}
              </Link>
            ) : (
              <span className="min-w-0 truncate font-semibold">{bar.label}</span>
            )}
            {bar.note && <span className="shrink-0 text-muted-foreground tabular-nums">{bar.note}</span>}
          </div>
          {/* Every bar scales against the same track; the room on the right keeps the value at the tip */}
          <div className="pr-24">
            <div className="relative flex h-5 items-center">
              {bar.value > 0 && <span aria-hidden className="h-3 rounded-r-[4px] bg-accent" style={{ width: `${(bar.value / max) * 100}%` }} />}
              <span className="absolute text-sm whitespace-nowrap tabular-nums" style={{ left: bar.value > 0 ? `calc(${(bar.value / max) * 100}% + 0.5rem)` : 0 }}>
                {bar.text}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
