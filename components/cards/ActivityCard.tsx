"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { getUserForClient } from '@/lib/actions/admin.actions'
import { calculateTimeAgo } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/lib/AppContext'

const ActivityCard = ({action, details, timestamp}: any) => {

    const [time, setTime] = useState("null");
    const [username, setUsername] = useState("user");
    const [email, setEmail] = useState("");
    const [orderId, setOrderId] = useState("");
    const [event, setEvent] = useState("");
    const [total, setTotal] = useState(0);

    const router = useRouter();

    interface User {
      email: string,
      username: string,
      password: string,
      admin: boolean,
      stripeId: string,
      date: string
    }

    const {pageChanged} = useAppContext()

    useEffect(()=> {

        const initialize = async ()=> {
           
            if(action ===  "order_created")
            {
             setEvent("New Order Has Been Made!")
             const user: User = await getUserForClient(details.user)

             if(user)
             {
                setUsername(user.username)
             }
             setOrderId(details.orderId)
             setTotal(details.pricing.total)
            }
            else if(action === "user_created")
            {   
                setEvent("New User Signed Up!")
                const user = await getUserForClient(details.userId)

                if(user)
                {
                   setUsername(user.username)
                   setEmail(user.email)
                }
            }else if(action === "user_subscribed")
            {
              setEvent("New Subscription to Newsletter!")
              setEmail(details.userEmail)
            }

            const getCurrentDate = new Date(); // Get the current date when the component is rendered
            const timeAgoString = calculateTimeAgo(getCurrentDate, timestamp); // Calculate the time ago string
            setTime(timeAgoString); 
        }

        initialize()
    }, [[pageChanged]])

    const handleView = ()=> {
        if(action === "user_created")
        {
            router.push(`/adminusers/${details.userId}`)
        }else if(action === "order_created")
        {
          router.push(`/adminorders/${details.orderId}`)
        }else if(action === "user_subscribed")
        {
          router.push(`/adminnewsletter`)
        }
    }


  return (
    <div className="mx-auto flex flex-wrap max-sm:flex-col  items-center justify-center gap-3 p-4">
    <div className="flex items-center gap-4">
    <Image 
        src="/assets/bell.png"
        alt="bell icon"
        width={22}
        height={22}
     />
      <p className="font-medium">{time}</p>
    </div>
    { action === "user_created" &&
    <div className="flex items-center gap-4">
     <Image 
        src="/assets/users.png"
        alt="users profile icon"
        width={22}
        height={22}
     />
      <p className="font-medium">{username}</p>
    </div>
    }
     { action === "order_created" &&
    <div className="flex flex-wrap items-center gap-4">
     <Image 
        src="/assets/orders.png"
        alt="order icon"
        width={22}
        height={22}
        className='max-xxs:mx-auto'
     />
      <p className="font-medium text-center">{orderId}</p>
    </div>
    }
    <div className="flex flex-wrap items-center gap-2">
    <Image 
        src="/assets/event.png"
        alt="event icon"
        width={22}
        height={22}
        className='max-xxs:mx-auto'
     />
      <p className="font-bold text-center">{event}</p>
    </div>
    { action === "order_created" &&
    <div className="flex items-center gap-2">
    <Image 
        src="/assets/dollar.png"
        alt="dollar icon"
        width={22}
        height={22}
     />
      <p className="font-medium text-center text-green-500">${total}</p>
    </div>
    }
    { action === "user_created" || action === "user_subscribed" &&
    <div className="flex flex-wrap items-center gap-2">
    <Image 
        src="/assets/email.png"
        alt="email icon"
        width={22}
        height={22}
        className='max-xxs:mx-auto'
     />
      <p className="font-medium text-center">{email}</p>
    </div>
    }
    <div className="flex items-center gap-4 max-xxs:mx-auto">
      <Button className="rounded-full" size="icon" variant="outline" onClick = {handleView}>
      <Image 
        src="/assets/ChevronRightIcon.svg"
        alt="right icon"
        width={22}
        height={22}
     />
        <span className="sr-only">View</span>
      </Button>
    </div>
    <div className="flex items-center gap-4 max-xxs:mx-auto w-[80%]">
        <div className="border-b border-gray-300 w-full"></div>
    </div>
  </div>
  )
}

export default ActivityCard

