"use client"

import React, {useState, useEffect} from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { addProductToCart, findProduct, removeProductFromCart } from '@/lib/actions/store.actions'
import { getRes } from '@/lib/s3'
import { Skeleton } from '../ui/skeleton'
import { useAppContext } from '@/lib/AppContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from '../ui/use-toast'

interface cartItem {
  product: string;
  quantity: number;
  update: boolean;
  setUpdate: React.Dispatch<React.SetStateAction<any>>;
}

const CartItem = ({product, quantity , update, setUpdate}: cartItem) => {
  const [myProduct , setMyProduct] = useState<any>({
    name: "Product Not Found",
    description: "", 
    stock: "0",
    price: "0",
    category: "null",
    photo: ""
  })
  const [img, setImg] = useState("/assets/spinner.svg")
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  
  const { data: session } = useSession();
  const {setCart, setProductAdjusted , productAdjusted} = useAppContext();

  const addToCartLocally = async ()=> {
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

  const removeFromCartLocally = async (removeAll: boolean = false) => {
    setCart((prevCart: { product: string; quantity: number }[]) => {
      const productIndex = prevCart.findIndex((item) => item.product === product);
  
      if (productIndex !== -1) {
        // If the product is found
        const updatedCart = [...prevCart];
        if (removeAll) {
          // If removeAll is true, remove the item completely
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

      setImg(await getRes(data?.photo))
      setLoading(true)
   
    }

    getProduct();
  }, [])

  const add = async () => {
    setEdit(true)
    if(session)
    {
      const added = await addProductToCart(session.user.id, product)

      if(!added)
      {
       toast({
        title: "Error",
        description: "Failed to add more items to server cart",
        variant: "destructive"
       })
      }
      setUpdate(!update)
    }else{
      await addToCartLocally();
      setUpdate(!update)
    }

    setEdit(false)
  };

  const subtract = async () => {
    setEdit(true)
    if(session)
    {
      try{
        await removeProductFromCart(session.user.id, product)
        setUpdate(!update)
      }catch(error)
      {
        toast({
          title: "Error",
          description: "Failed to remove product from cart in database",
          variant: "destructive"
         })
      }
    }else{
      await removeFromCartLocally();
      setUpdate(!update)
    }
    setEdit(false)
  };

  const deleteProduct = async () => {
    setLoading(true)
    if(session)
    {
      try{
        await removeProductFromCart(session.user.id, product, 1, true)
        //update the global state so nav bar can update
        setProductAdjusted(!productAdjusted)
        //set update so that the products can refresh on the main cart
        setUpdate(!update)
      }catch(error)
      {
        toast({
          title: "Failure to remove from database",
          description: "There was an error and the item failed to be removed. Please try again", 
          variant: "destructive",
        })
      }
    }else{
      await removeFromCartLocally(true)
      //update the global state so nav bar can update
      setProductAdjusted(!productAdjusted)
      setUpdate(!update)
    }

    toast({
      title: "Removed from cart",
    })

    setLoading(false)

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
        <h2 className="font-semibold hover:underline hover:text-blue">
          {!myProduct.name  ? "Product Not Found" : myProduct.name}
          </h2>
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
          <h4 className={`px-2 ${edit? "hidden" : ""}`}>{quantity}</h4>
          <Image 
            src="/assets/lineloader.svg"
            alt='loading animation'
            width={24}
            height={24}
            className={`${!edit? "hidden" : "px-2"}`}
          />
          <Button className='bg-white p-1.5' variant="outline" onClick={add}>
            <Image 
            src="/assets/plus.png"
            alt="add icon"
            width={34}
            height={34}
            />
            <span className="sr-only">Add</span>
          </Button>
        </div>
        <div className={`text-red-500 ${quantity > myProduct.stock ? '' : 'hidden'}`}>amount has exceeded stock</div>
        <div className={`text-red-500 ${myProduct.stock === 0 ? '' : 'hidden'}`}>item is out of stock</div>
        <div className="font-semibold">${(myProduct.price * quantity).toFixed(2)}</div>
      </div>
      <Button  size="icon" variant="outline" onClick={async()=> {await deleteProduct()}}>
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