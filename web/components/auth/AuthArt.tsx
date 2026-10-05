import Image from "next/image";
import type { Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// The first product stands in the middle, largest and drifting; the next two lean in from the sides
const places = [
  "left-1/2 top-[15%] h-[46%] w-[32%] -translate-x-1/2 animate-float",
  "left-[9%] top-[33%] h-[23%] w-[22%] -rotate-18",
  "right-[9%] top-[36%] h-[25%] w-[22%] rotate-16",
];

// The pictures are decoration, so they have no alt text
export function AuthArt({ products }: { products: Product[] }) {
  return (
    <aside aria-label="Why have an account" className="relative isolate flex min-h-[640px] flex-col justify-end overflow-hidden rounded-[32px] border bg-[radial-gradient(80%_70%_at_50%_110%,var(--stage-violet),var(--surface-sunk)_70%)] p-10 max-lg:hidden">
      <div aria-hidden className="opacity-(--glow-strength)">
        <span className="absolute left-[8%] top-[30%] size-80 rounded-full bg-glow-pink opacity-30 blur-[90px]" />
        <span className="absolute right-[6%] top-[18%] size-90 rounded-full bg-glow-blue opacity-30 blur-[90px]" />
      </div>
      <div aria-hidden className="bg-studio-grid absolute inset-0" />

      {products.slice(0, 3).map((product, i) => (
        <div key={product.id} className={cn("absolute", places[i])}>
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="20vw"
            className={cn("object-contain", i === 0 ? "[filter:drop-shadow(0_40px_50px_var(--shadow-strong))]" : "[filter:drop-shadow(0_30px_40px_var(--shadow))]")}
          />
        </div>
      ))}

      <div className="relative grid gap-3.5">
        <p className="text-[44px] font-semibold leading-none tracking-[-0.05em]">
          Check out faster.
          <br />
          <span className="text-brand-gradient">Follow every order.</span>
        </p>
        <p className="max-w-[380px] text-[15px] leading-relaxed text-muted-foreground">
          An account keeps your addresses, speeds up checkout and lets you follow every order to your door.
        </p>
      </div>
    </aside>
  );
}
