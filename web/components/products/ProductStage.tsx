import Image from "next/image";
import { glowFor } from "@/lib/glow";
import { cn } from "@/lib/utils";

type Props = {
  productId: number;
  imageUrl: string;
  // The next/image sizes hint for where the stage is used
  sizes: string;
  priority?: boolean;
  // Sold out: the product fades back
  dimmed?: boolean;
  className?: string;
  // Laid over the stage, like badges
  children?: React.ReactNode;
};

// A product standing in its own light: a soft glow in the color picked for it, and the picture fitted
// inside, never cropped. Cut-outs float with a real shadow; a photo shows whole, like a print. Inside a
// .group, hovering lifts the glow and brings the product closer.
export function ProductStage({ productId, imageUrl, sizes, priority = false, dimmed = false, className, children }: Props) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)} style={{ "--glow": glowFor(productId) } as React.CSSProperties}>
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 aspect-square w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--glow) opacity-[calc(0.38*var(--glow-strength))] blur-[70px] transition-opacity duration-400 group-hover:opacity-[calc(0.6*var(--glow-strength))]"
      />
      <div className="absolute inset-x-[12%] bottom-[9%] top-[11%] transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.07]">
        {/* The product's name is always beside its stage, so the picture doesn't repeat it to screen readers */}
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-contain [filter:drop-shadow(0_30px_34px_var(--shadow))]", dimmed && "opacity-45")}
        />
      </div>
      {children}
    </div>
  );
}
