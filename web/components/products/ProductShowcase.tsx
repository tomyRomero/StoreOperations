"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { glowFor } from "@/lib/glow";

type Props = {
  productId: number;
  name: string;
  imageUrl: string;
};

// Clicking the product opens the picture as large as the screen allows
export function ProductShowcase({ productId, name, imageUrl }: Props) {
  const glow = glowFor(productId);

  return (
    <Dialog>
      <div
        className="relative isolate h-[420px] overflow-hidden rounded-[28px] border bg-[radial-gradient(70%_80%_at_50%_100%,color-mix(in_oklab,var(--glow)_22%,var(--stage-end)),var(--stage-end)_70%)] sm:h-[560px] lg:h-[760px] lg:rounded-[32px]"
        style={{ "--glow": glow } as React.CSSProperties}
      >
        <div aria-hidden className="absolute left-1/2 top-[46%] -z-10 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--glow) opacity-[calc(0.4*var(--glow-strength))] blur-[100px]" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-size-[48px_48px] [mask-image:radial-gradient(55%_55%_at_50%_50%,#000,transparent_80%)]"
        />
        <DialogTrigger asChild>
          <button type="button" className="absolute inset-[11%_10%_10%] cursor-zoom-in rounded-3xl sm:inset-[13%_15%_12%]" aria-label={`Zoom in on ${name}`}>
            <span className="absolute inset-0 animate-float">
              <Image src={imageUrl} alt={name} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 560px, 80vw" className="object-contain [filter:drop-shadow(0_40px_50px_var(--shadow-strong))]" />
            </span>
          </button>
        </DialogTrigger>
        <span aria-hidden className="absolute bottom-6 right-6 font-mono text-xs text-faint max-sm:hidden">
          Click to zoom
        </span>
      </div>

      <DialogContent className="h-[min(90vh,900px)] max-w-[min(92vw,1100px)] grid-rows-[minmax(0,1fr)] rounded-[32px] border-foreground/10 bg-[radial-gradient(70%_80%_at_50%_100%,var(--stage-blue),var(--stage-end)_70%)] p-6 sm:p-10">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">The picture of {name}, enlarged.</DialogDescription>
        <div className="relative">
          <Image src={imageUrl} alt={name} fill sizes="92vw" className="object-contain [filter:drop-shadow(0_40px_50px_var(--shadow))]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
