"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Props = {
  id: string;
  title: string;
  href: string;
  // The product cards, each in its own <li>
  children: React.ReactNode;
};

// Whether the row can scroll further back or forward
function edges(list: HTMLElement) {
  return { atStart: list.scrollLeft <= 4, atEnd: list.scrollLeft + list.clientWidth >= list.scrollWidth - 4 };
}

const arrow =
  "grid size-12 place-items-center rounded-full border border-foreground/14 transition-colors enabled:hover:bg-foreground/6 disabled:text-faint disabled:opacity-60";

// Swiped on phones; on larger screens the arrows step a screen at a time
export function ProductCarousel({ id, title, href, children }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const [{ atStart, atEnd }, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => setEdges(edges(list)));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const step = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.9, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section aria-labelledby={`${id}-heading`} className="container pt-18 lg:pt-40">
      <div className="mb-5 flex items-end justify-between gap-4 lg:mb-10">
        <h2 id={`${id}-heading`} className="text-[32px] font-semibold leading-none tracking-[-0.045em] lg:text-5xl">
          {title}
        </h2>
        <Link href={href} className="text-sm text-muted-foreground hover:text-foreground md:hidden">
          See all
        </Link>
        <div className="flex gap-2 max-md:hidden">
          <button type="button" aria-label="Scroll back" aria-controls={`${id}-list`} disabled={atStart} onClick={() => step(-1)} className={arrow}>
            <ArrowLeft className="size-[18px]" aria-hidden />
          </button>
          <button type="button" aria-label="Scroll forward" aria-controls={`${id}-list`} disabled={atEnd} onClick={() => step(1)} className={arrow}>
            <ArrowRight className="size-[18px]" aria-hidden />
          </button>
        </div>
      </div>
      <ul
        ref={listRef}
        id={`${id}-list`}
        onScroll={(event) => setEdges(edges(event.currentTarget))}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:gap-4 lg:mx-0 lg:scroll-px-0 lg:px-0 [&>li]:w-[236px] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[calc((100%-1rem)/2)] lg:[&>li]:w-[calc((100%-3rem)/4)]"
      >
        {children}
      </ul>
    </section>
  );
}
