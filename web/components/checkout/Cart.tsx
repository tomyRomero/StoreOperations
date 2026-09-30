"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import CartItem from "./CartItem";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loading from "@/app/(auth)/loading";
import { toast } from "../ui/use-toast";
import { useCart } from "../cart/CartProvider";
import { useCurrentUser } from "../CurrentUserProvider";
import { formatMoney } from "@/lib/money";
import { signInPath } from "@/lib/sign-in-path";

type Props = {
  shippingFlatRateCents: number | null;
  freeShippingThresholdCents: number | null;
};

// The cart, priced by the API. Checkout opens once every line can be bought as it is.
const Cart = ({ shippingFlatRateCents, freeShippingThresholdCents }: Props) => {
  const router = useRouter()
  const user = useCurrentUser();
  const { cart } = useCart();

  if (!cart) return <Loading />;

  const freeShipping = freeShippingThresholdCents !== null && cart.subtotalCents >= freeShippingThresholdCents;
  const shippingCents = cart.lines.length === 0 || freeShipping ? 0 : shippingFlatRateCents;

  const handleCheckout = ()=> {
    if (!user) {
      router.push(signInPath("/cart"))
    } else if (cart.canCheckout) {
      router.push("/checkout")
    } else {
      toast({
        title: "Some items can't be bought",
        description: "Change or remove the items marked in your cart, then try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
          <div className="flex">
            <h1 className="text-heading3-bold font-semibold mb-6">Cart</h1>
            <Image
            src="/assets/cart.png"
            alt="cart icon"
            width={28}
            height={28}
            className="px-1 w-8 h-6 align-middle mt-2"
          />
          </div>
        <div className="flex mb-4">
         <Button className="flex px-2 border border-black" variant="ghost" onClick={() => router.back()}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:gap-8">

          <div className="flex flex-col gap-2">
          {cart.lines.map((line) => (
            <CartItem key={line.productId} line={line} />
          ))}

          {cart.lines.length === 0 &&
            <h1 className="p-4 text-heading2-bold">Cart is empty</h1>
          }
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h2 className="font-semibold text-heading4-bold text-lg mb-4">Summary:</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-medium">{formatMoney(cart.subtotalCents)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span className="font-medium">{shippingCents === null ? "At checkout" : shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Total before tax:</span>
                <span className="font-medium">{formatMoney(cart.subtotalCents + (shippingCents ?? 0))}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout} disabled={cart.lines.length === 0}>
                {user ? "Checkout" :  "Sign in to Checkout"}
              </Button>
              <div className={`text-red-500 ${cart.canCheckout || cart.lines.length === 0 ? 'hidden' : ''}`}>One or more items can&apos;t be bought as they are</div>
            </div>
            <div className="py-0.5">
            <Link className="hover:underline" href="/products" >
              Continue Shopping
            </Link>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Cart;
