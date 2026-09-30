"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/api/types"
import { formatMoney } from "@/lib/money"
import { useCart } from "../cart/CartProvider"
import ProductCard from "./ProductCard"
import { toast } from "../ui/use-toast"

const ProductDetails = ({ product, related }: { product: Product; related: Product[] }) => {
    const router = useRouter();
    const cart = useCart();
    const [loading, setLoading] = useState(false);

    const { name, description, stock, categoryName: category, imageUrl: img } = product;
    const deal = product.compareAtPriceCents !== null;
    const price = formatMoney(product.priceCents);
    const oldPrice = product.compareAtPriceCents !== null ? formatMoney(product.compareAtPriceCents) : "";
    const inCart = cart.isInCart(product.id);

  const goBack = ()=> {
    router.back();
  }

  // The cart checks stock ("Only 3 left") and says why when it can't add
  const addToCart = async ()=> {
    if(inCart)
    {
      router.push("/cart")
      return;
    }

    setLoading(true)
    if (await cart.add(product.id)) {
      toast({
        title: "Added to Cart",
      })
    }
    setLoading(false)
  }

  return (
      <>
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start mx-auto pt-4 max-md:pt-6">
      <div className="flex lg:hidden mb-4">
         <Button className="flex px-2 border border-black" variant="ghost" onClick={goBack}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
      <div className="flex items-start lg:hidden">
          <h1 className="font-bold text-heading3-bold">{name}</h1>
          {deal ? ( 
          <div className="text-heading3-bold font-bold ml-auto"><span className="text-red-500 line-through">{oldPrice}</span>  <span className="text-green-500">{price}</span></div>) 
          : 
           <div className="text-heading3-bold font-bold ml-auto text-green-500">{price}</div>}
        </div>
        <div className="flex items-start lg:hidden">
          <small className="text-body-semibold leading-none text-gray-500">{category.toLocaleLowerCase()}</small>
          <h4 className={`ml-auto ${stock > 0 ? "text-green-500" : "text-red-500"}` }>{stock > 0 ? "In Stock" : "Out of stock"}</h4>
        </div>
        <div className="lg:hidden">
          <p className="text-body-semibold">
            {description}
          </p>
        </div>
        <Button className="flex px-6 border border-black lg:hidden w-3/4 mx-auto" variant="ghost" onClick={addToCart}>
           <span className="ml-2">
            {!loading && 
              (inCart ? "View Cart" : "Add to Cart")
            }
         
            {loading &&
              <Image src="/assets/lineloader.svg"
                alt="loading animation"
                width={44}
                height={24}
              />
            }
          </span>
        </Button>
      <div className="grid lg:grid-cols-5 gap-3 items-start">
        <div className="lg:col-span-4">
          <Image
            alt="Product Image"
            className="aspect-square object-cover border border-gray-200 w-full rounded-xl overflow-hidden max-h-[450px]"
            height={400}
            src={img}
            width={600}
            priority
          />
        </div>
      </div>
      <div className="grid gap-4 lg:gap-10 items-start">
        <div className="flex mb-4 max-lg:hidden">
        <Button className="flex px-2 border border-black" variant="ghost" onClick={goBack}>
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={28}
            height={28}
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </div>
        <div className="hidden lg:flex items-start">
          <div className="grid gap-3">
            <h1 className="text-heading3-bold font-bold">{name}</h1>

        <div className="flex flex-col">
        <small className="text-body-semibold leading-none text-gray-500">{category.toLocaleLowerCase()}</small>
        <h4 className={`${stock > 0 ? "text-green-500" : "text-red-500"} pt-2` }>{stock > 0 ? "In Stock" : "Out of stock"}</h4>
        </div>
          </div>
          {deal ? ( 
          <div className="text-heading3-bold font-bold ml-auto"><span className="text-red-500 line-through">{oldPrice}</span>  <span className="text-green-500">{price}</span></div>) 
          : 
           <div className="text-heading3-bold font-bold ml-auto text-green-500">{price}</div>}
        </div>
        <div>
        <p className="text-body-semibold max-lg:hidden">
            {description}
        </p>
        </div>
        <Button className="flex px-6 border border-black w-3/4 mx-auto max-lg:hidden" variant="ghost" onClick={addToCart}>
          <span className="ml-2">
            {!loading && 
              (inCart ? "View Cart" : "Add to Cart")
            }
         
            {loading &&
              <Image src="/assets/lineloader.svg"
                alt="loading animation"
                width={44}
                height={24}
              />
            }
          </span>
        </Button>
      </div>
    </div>
        <div className="container mx-auto px-4 py-6">
        <h2 className="text-heading3-bold font-bold mb-4">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {related.map((item)=> (
                  <ProductCard key={item.id} product={item} />
                  ))}
        </div>
        </div>
        </>
  )
}

export default ProductDetails