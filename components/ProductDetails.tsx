"use client"

import { Button } from "@/components/ui/button"
import { ProductType } from "@/app/types/global"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getRes } from "@/lib/s3"
import { useRouter } from "next/navigation"
import { addProductToCart } from "@/lib/actions/store.actions"
import { useSession } from "next-auth/react"
import { useAppContext } from "@/lib/AppContext"
import ProductCard from "./cards/ProductCard"
import Loading from "@/app/(auth)/loading"

type ProductDetailsType = ProductType & {
  result: boolean;
  serverProducts: ProductType[]
};


const ProductDetails = ({stripeProductId, name, description, stock, photo, price, category, result, serverProducts}: ProductDetailsType)=> {
 
    const { data: session } = useSession();
    const [inCart, setInCart] = useState(result);
    const [img, setImg] = useState("/assets/spinner.svg")
    const router = useRouter();
    const {cart, setCart} = useAppContext();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false)

    const {productAdjusted, setProductAdjusted} = useAppContext()

    useEffect(() => { 
      const load = async () => {
      setImg(await getRes(photo))

      if (!result && !session) {
        // If result is false, check localStorage
        const localStorageCartString = localStorage.getItem('cart');
        if (localStorageCartString) {
          // If localStorage has cart data, parse it and check if the product is in the cart
          const localStorageCart = JSON.parse(localStorageCartString);
          console.log("localstorage: ", localStorageCart)
          
         
          setInCart(localStorageCart?.some((item: { product: string }) => item.product === stripeProductId));
          
        } else {
          // If localStorage doesn't have cart data, check the global state cart
          setInCart(cart.some(item => item.product === stripeProductId));
        }
      }

      setMounted(true)
    }
    
    load()
  
  }, [])

  const goBack = ()=> {
    router.back();
  }

 
  const addToCartLocally = ()=> {
    setCart((prevCart: {product: string, quantity:number}[]) => {
      const productIndex = prevCart.findIndex((item) => item.product === stripeProductId);
  
      if (productIndex !== -1) {
        // If the product is found, adjust the quantity
        const updatedCart = [...prevCart];
        updatedCart[productIndex] = { ...prevCart[productIndex], quantity: prevCart[productIndex].quantity + 1 };
        
        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      } else {
        // If the product is not found, add a new product
        const newCart = [...prevCart, { product: stripeProductId, quantity: 1 }];
        // Save the new cart to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      }
    });
    
  }
  

  const addToCart = async ()=> {
    setLoading(true)

    //If item is already in cart redirect to the cart
    if(inCart)
    {
      router.push("/cart")
    }else{

      //If User is logged in, add product to the cart on the server to the database
      if(session)
      {
        const added = await addProductToCart(session.user.id, stripeProductId)

        if(added)
        {
          setInCart(true)
           //Call global state to let the app know a product in the cart was added
          setProductAdjusted(!productAdjusted)
        }else
        {
          alert("Error adding to cart")
        }
      }else{
        //If user is not logged in, add the product to the cart to the local storage
        addToCartLocally();
        setInCart(true)
         //Call global state to let the app know a product in the cart was added
        setProductAdjusted(!productAdjusted)
      }

     
    }
    
    setLoading(false)
    
  }

  return (
    <>
    {mounted ?  (
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
          <div className="text-heading3-bold font-bold ml-auto">${price}</div>
        </div>
        <div className="flex items-start lg:hidden">
          <small className="text-body-semibold leading-none text-gray-500">{category.toLocaleLowerCase()}</small>
          <h4 className={`ml-auto ${Number(stock) > 0 ? "text-green-500" : "text-red-500"}` }>{Number(stock) > 0 ? "In Stock" : "Out of stock"}</h4>
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
        <h4 className={`${Number(stock) > 0 ? "text-green-500" : "text-red-500"} pt-2` }>{Number(stock) > 0 ? "In Stock" : "Out of stock"}</h4>
        </div>
          </div>
          <div className="text-heading3-bold font-bold ml-auto">${price}
          </div>
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
        {serverProducts.map((product: any)=> (
                  <ProductCard key={product.stripeProductId} 
                  stripeProductId={product.stripeProductId} 
                  name={product.name}
                  description={product.description} 
                  stock={product.stock} 
                  price={product.price}
                  category={product.category} 
                  photo={product.photo}/>
                  ))}
        </div>
        </div>
        </>
    ) : 
    (<Loading />)
    }
    </>
  )
}

export default ProductDetails