import Image from "next/image";
import { glowFor } from "@/lib/glow";
import { cn } from "@/lib/utils";

type Props = {
  productId: number;
  imageUrl: string;
  // The thumbnail's size and corners, such as "size-21 rounded-[18px]"
  className?: string;
  sizes: string;
};

// Decorative: the product's name is always beside it
export function ProductThumb({ productId, imageUrl, className, sizes }: Props) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-muted", className)} style={{ "--glow": glowFor(productId) } as React.CSSProperties}>
      <span aria-hidden className="absolute inset-[17%] rounded-full bg-(--glow) opacity-[calc(0.45*var(--glow-strength))] blur-[16px]" />
      <Image src={imageUrl} alt="" fill sizes={sizes} className="object-contain p-[14%]" />
    </span>
  );
}
