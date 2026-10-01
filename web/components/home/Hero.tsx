import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroImage from "@/public/assets/art.jpg";

// Full-bleed photo with the words set straight on it, over a dark scrim that keeps them readable
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-primary">
      <Image
        src={heroImage}
        alt=""
        priority
        placeholder="blur"
        sizes="100vw"
        className="absolute inset-0 -z-10 size-full object-cover object-[70%_40%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/10 md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent" />

      <div className="container flex min-h-[560px] flex-col justify-end py-12 md:min-h-[620px] md:justify-center lg:min-h-[680px]">
        <div className="max-w-xl text-white">
          <p className="text-sm font-semibold text-white/85">Art supplies, shipped across the US</p>
          <h1 id="hero-heading" className="mt-3 text-display">
            Color for every canvas.
          </h1>
          <p className="mt-5 max-w-md text-body-lg text-white/85">
            Artist-grade paint, brushes and canvas for studio days and weekend projects.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
              <Link href="/products">Shop all supplies</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/products?sale=1">See deals</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
