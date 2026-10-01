import { cn } from "@/lib/utils";

// The brand's four pigments, in the order they appear in the mark and the stripe
const pigments = ["bg-pigment-magenta", "bg-pigment-cobalt", "bg-pigment-yellow", "bg-pigment-green"];

// The mark: four paint chips, one per pigment. Decorative, so screen readers skip it.
export function PaletteMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-6 shrink-0 grid-cols-2 gap-0.5", className)}>
      {pigments.map((pigment) => (
        <span key={pigment} className={cn("rounded-[2px]", pigment)} />
      ))}
    </span>
  );
}

// The mark and the wordmark. The wordmark is real text, so it reads as the store's name.
export function Logo({ name = "Palettehub", className }: { name?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PaletteMark />
      <span className="font-display text-xl font-extrabold tracking-tight">{name}</span>
    </span>
  );
}

// The thin four-pigment stripe across the very top of every page
export function PaletteStripe({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("grid h-1 grid-cols-4", className)}>
      {pigments.map((pigment) => (
        <span key={pigment} className={pigment} />
      ))}
    </div>
  );
}
