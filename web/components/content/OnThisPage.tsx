"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// The reading pages' contents, beside the text on large screens. It marks the section being read: the
// topmost one in the band a fifth of the way down the window, or the one just picked here (the last
// sections can be too short to scroll up into that band).
export function OnThisPage({ sections }: { sections: { id: string; title: string }[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  const ids = sections.map((section) => section.id).join(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    for (const id of ids.split(" ")) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav aria-labelledby="on-this-page" className="grid gap-0.5 self-start border-l border-foreground/10 pl-3.5 max-lg:hidden lg:sticky lg:top-28">
      <h2 id="on-this-page" className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">
        On this page
      </h2>
      {sections.map(({ id, title }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={current === id ? "true" : undefined}
          onClick={() => setCurrent(id)}
          className={cn("relative py-1.5 text-[15px] transition-colors", current === id ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <span aria-hidden className={cn("absolute -left-[15px] inset-y-1.5 w-0.5 rounded-full", current === id ? "bg-accent" : "bg-transparent")} />
          {title}
        </a>
      ))}
    </nav>
  );
}
