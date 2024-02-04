"use client"

import React, {useState, useEffect} from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Loading from '@/app/(auth)/loading'
import { addProductToCart, findProduct, removeProductFromCart } from '@/lib/actions/store.actions'
import { ProductType } from '@/app/types/global'
import { getRes } from '@/lib/s3'
import { Skeleton } from '../ui/skeleton'
import { useRouter } from 'next/router'
import { useAppContext } from '@/lib/AppContext'
import { useSession } from 'next-auth/react'
import { revalidate } from '@/lib/actions/admin.actions'
import Link from 'next/link'

interface cartItem {
  product: string;
  quantity: number;
  updateTotal: Function;
  index: number;
  update: boolean;
  setUpdate: React.Dispatch<React.SetStateAction<any>>;
}

const CartItem = ({product, quantity , updateTotal, index , update, setUpdate}: cartItem) => {
  const [myProduct , setMyProduct] = useState<any>({
    name: "Product Not Found",
    description: "", 
    stock: "0",
    price: "0",
    category: "null",
    photo: ""
  })
  const [subTotal, setSubTotal] = useState(0);
  const [ insideQuantity , setInsideQuantity] = useState(quantity)
  const [img, setImg] = useState("/assets/spinner.svg")
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession();
  const {cart, setCart} = useAppContext();

  const addToCartLocally = ()=> {
    setCart((prevCart: {product: string, quantity:number}[]) => {
      const productIndex = prevCart.findIndex((item) => item.product === product);
  
      if (productIndex !== -1) {
        // If the product is found, adjust the quantity
        const updatedCart = [...prevCart];
        updatedCart[productIndex] = { ...prevCart[productIndex], quantity: prevCart[productIndex].quantity + 1 };
        
        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      } else {
        // If the product is not found, add a new product
        const newCart = [...prevCart, { product: product, quantity: 1 }];
        // Save the new cart to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      }
    });
    
  }

  const removeFromCartLocally = (removeAll: boolean = false) => {
    setCart((prevCart: { product: string; quantity: number }[]) => {
      const productIndex = prevCart.findIndex((item) => item.product === product);
  
      if (productIndex !== -1) {
        // If the product is found
        const updatedCart = [...prevCart];
        if (removeAll) {
          // If removeAll is true, remove the item
          updatedCart.splice(productIndex, 1);
        } else if (prevCart[productIndex].quantity > 1) {
          // If quantity is greater than 1, decrement it
          updatedCart[productIndex] = { ...prevCart[productIndex], quantity: prevCart[productIndex].quantity - 1 };
        }
  
        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      }
  
      // If the product is not found, return the current cart
      return prevCart;
    });
  };  

  useEffect(()=> {
    const getProduct = async ()=> {
      const data = await findProduct(product);
     
        setMyProduct({
          name: data?.name,
          description: data?.description,
          stock: data?.stock,
          price: data?.price,
          category: data?.category,
          photo: data?.photo
        })
      
      setSubTotal(data?.price * quantity)

      setImg(await getRes(data?.photo))
      setLoading(true)
    }

    getProduct();
  }, [])

  useEffect(() => {
    updateTotal(index, subTotal);
    
  }, [subTotal]);

  const add = async () => {
    setInsideQuantity((prevInsideQuantity: number) => {
      const newQuantity = prevInsideQuantity + 1;
      const newSubTotal = myProduct.price * newQuantity;
      setSubTotal(newSubTotal);
      return newQuantity;
    });

    if(session)
    {
      const added = await addProductToCart(session.user.id, product)

      if(!added)
      {
        alert("Error adding product to cart in database")
      }
    }else{
      addToCartLocally();
    }

  };

  const subtract = async () => {
    setInsideQuantity((prevInsideQuantity: number) => {
      const newQuantity = prevInsideQuantity <= 1 ? 1 : prevInsideQuantity - 1;
      const newSubTotal = myProduct.price * newQuantity;
      setSubTotal(newSubTotal);
      return newQuantity;
    });

    if(session)
    {
      try{
        await removeProductFromCart(session.user.id, product)
      }catch(error)
      {
        alert("error removing product from cart in database")
      }
    }else{
      removeFromCartLocally();
    }

  };

  const deleteProduct = async () => {
    if(session)
    {
      try{
        await removeProductFromCart(session.user.id, product, 1, true)
        updateTotal(index, 0);
        setUpdate(!update)
      }catch(error)
      {
        alert("error removing product from cart in database")
      }
    }else{
      removeFromCartLocally(true)
      updateTotal(index, 0);
      setUpdate(!update)
    }

  }

  return (
    <>
      {loading ? (<div className="space-y-6 ">
    <div className="flex gap-4 p-4 rounded-lg border">
      <Image
        alt={`${myProduct.name} product picture`}
        className="aspect-square object-cover w-24 h-24 rounded-lg max-sm:w-16 max-sm:h-16"
        height={100}
        src={img}
        width={100}
      />
      <div className="flex-1 grid gap-2">
        <Link href={`/products/${product}`}>
        <h2 className="font-semibold hover:underline hover:text-blue">{myProduct.name}</h2>
        </Link>
        <h2 className="text-base-regular">Quantity:</h2>
        <div className="flex items-center">
          <Button className='bg-white p-1.5' variant="outline" onClick={subtract}>
            <Image 
            src="/assets/minus.png"
            alt="subtract icon"
            width={24}
            height={24}
            />
            <span className="sr-only">Subtract</span>
          </Button>
          <h4 className='px-2'>{insideQuantity}</h4>
          <Button className='bg-white p-1.5' variant="outline" onClick={add}>
            <Image 
            src="/assets/plus.png"
            alt="add icon"
            width={24}
            height={24}
            />
            <span className="sr-only">Add</span>
          </Button>
        </div>
        <div className={`text-red-500 ${insideQuantity > myProduct.stock ? '' : 'hidden'}`}>amount has exceeded stock</div>
        <div className={`text-red-500 ${myProduct.stock === 0 ? '' : 'hidden'}`}>item is out of stock</div>
        <div className="font-semibold">${subTotal.toFixed(2)}</div>
      </div>
      <Button  size="icon" variant="outline" onClick={deleteProduct}>
        <Image 
        src="/assets/delete.png"
        alt="trash icon"
        width={24}
        height={24}
        />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  </div>) : (
      <div className="mt-5 flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )}
    </>
  )
}

export default CartItem