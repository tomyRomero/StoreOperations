import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, Truck } from "lucide-react";
import { shippingFor, toFreeShipping, type ShippingSettings } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

// Parts of checkout's first step, the same for customers and guests

export const stepLegend = "mb-3.5 font-sans text-lg font-semibold";

// The one way the store ships, with its price for this bag
export function DeliveryOption({ shipping, subtotalCents }: { shipping: NonNullable<ShippingSettings>; subtotalCents: number }) {
  const shippingCents = shippingFor(subtotalCents, shipping);
  const missing = toFreeShipping(subtotalCents, shipping);

  return (
    <section aria-labelledby="delivery-heading">
      <h2 id="delivery-heading" className={stepLegend}>
        Delivery
      </h2>
      <div className="flex items-center gap-4 rounded-[20px] border border-glow-violet/60 bg-glow-violet/8 px-5 py-4.5">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-foreground/6">
          <Truck className="size-[22px]" strokeWidth={1.8} />
        </span>
        <span className="grid grow gap-0.5">
          <span className="text-[15px] font-semibold">Standard shipping, tracked</span>
          <span className="text-[13px] text-muted-foreground">
            {missing === null ? "To any address in the United States" : missing === 0 ? "Free on this order" : `Add ${formatMoney(missing)} more to your bag and it's free`}
          </span>
        </span>
        <span className="font-mono text-[15px] font-medium">{shippingCents === 0 ? "Free" : shippingCents === null ? "" : formatMoney(shippingCents)}</span>
      </div>
    </section>
  );
}

// Back to the bag, or on to payment. The button submits the step's form, or calls onContinue.
export function ContinueToPayment({ going, disabled = false, onContinue }: { going: boolean; disabled?: boolean; onContinue?: () => void }) {
  return (
    <div className="flex flex-wrap-reverse items-center justify-between gap-4">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-[15px] text-ink-2 hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Back to bag
      </Link>
      <button
        type={onContinue ? "button" : "submit"}
        disabled={disabled || going}
        onClick={onContinue}
        className="inline-flex h-[58px] items-center gap-2.5 rounded-button bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_20px_50px_color-mix(in_oklab,var(--glow-violet)_30%,transparent)] transition-colors hover:bg-primary/85 disabled:opacity-60 max-sm:w-full max-sm:justify-center"
      >
        {going && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Continue to payment
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
