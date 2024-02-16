"use client"

import { getUserClient } from '@/lib/actions/admin.actions'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const UserDetailsCard = ({userId}: any) => {
    const [username, setUsername] = useState("Username not found")
    const [email, setEmail] = useState("Email not found")
    const [date, setDate] = useState("Date not found")

    useEffect(()=> {
        const getData = async ()=> 
        {
          const data = await getUserClient(userId);

          if(data){
            setUsername(data.username)
            setEmail(data.email)
            setDate(data.date)
          }
        }

        getData();
    }, [])


  return (
    <div className='grid grid-cols-1'>
         <div className="flex items-center">
            <div className="font-bold text-black">Customer:</div>
            
            <div className="ml-auto font-medium underline hover:text-blue">
            <Link href={`/adminusers/${userId}`}>
                {username}
            </Link>
            </div>
           
          </div>
          <div className="flex flex-wrap items-center">
            <div className="font-bold text-black">Customer's Email:</div>
            <div className="ml-auto font-medium">{email}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-black">Member Since:</div>
            <div className="ml-auto font-medium">{date}</div>
          </div>
    </div>
  )
}

export default UserDetailsCard