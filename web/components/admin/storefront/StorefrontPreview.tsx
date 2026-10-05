"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  // The store page with the unsaved values: /?draft=..., or /about?draft=...
  src: string;
  device: "desktop" | "phone";
};

const widths = { desktop: 1280, phone: 390 };
const heights = { desktop: 1180, phone: 760 };

type Frame = { id: number; src: string; ready: boolean };

// The real storefront in a frame, at a desktop or phone width, shrunk to fit. A changed address loads in a
// second frame behind the first and takes its place once it has painted, at the same scroll position, so
// the preview never flashes white while the admin types.
export function StorefrontPreview({ src, device }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([{ id: 0, src, ready: false }]);
  const refs = useRef(new Map<number, HTMLIFrameElement>());
  const nextId = useRef(1);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFrames((current) => (current.at(-1)?.src === src ? current : [...current, { id: nextId.current++, src, ready: false }]));
  }, [src]);

  const loaded = (id: number) => {
    const shown = frames.findLast((f) => f.ready);
    const scroll = shown ? (refs.current.get(shown.id)?.contentWindow?.scrollY ?? 0) : 0;
    refs.current.get(id)?.contentWindow?.scrollTo(0, scroll);
    setFrames((current) => {
      const index = current.findIndex((f) => f.id === id);
      if (index < 0) return current;
      // This frame and anything newer stay; older ones are done
      return current.slice(index).map((f) => (f.id === id ? { ...f, ready: true } : f));
    });
  };

  const width = widths[device];
  const height = heights[device];
  const scale = boxWidth ? Math.min(1, boxWidth / width) : 1;
  const showing = frames.findLast((f) => f.ready)?.id ?? frames[0].id;

  return (
    <div ref={box} className="w-full">
      <div
        className={cn("relative mx-auto overflow-hidden bg-card", device === "phone" ? "rounded-[28px] border-[6px] border-foreground/80" : "rounded-lg border")}
        style={{ width: width * scale + (device === "phone" ? 12 : 2), height: height * scale + (device === "phone" ? 12 : 2) }}
      >
        {frames.map((frame) => {
          const visible = frame.id === showing;
          return (
            <iframe
              key={frame.id}
              ref={(element) => {
                if (element) refs.current.set(frame.id, element);
                else refs.current.delete(frame.id);
              }}
              src={frame.src}
              title={visible ? "Preview of the store with your changes" : "Loading the next preview"}
              onLoad={() => loaded(frame.id)}
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              className={cn("absolute left-0 top-0 origin-top-left border-0 bg-background", !visible && "invisible")}
              style={{ width, height, transform: `scale(${scale})` }}
            />
          );
        })}
      </div>
    </div>
  );
}
