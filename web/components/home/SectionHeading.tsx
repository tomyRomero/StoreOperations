import Link from "next/link";
import { ArrowRight } from "lucide-react";

// A home page section's title, with a link to see everything in it
export function SectionHeading({ id, title, description, href, linkLabel }: { id: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline">
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
