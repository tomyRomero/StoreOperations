"use client"

import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Card } from '../ui/card'
import { usePathname } from 'next/navigation'
import { unsubscribeFromNewsletter } from '@/lib/actions/store.actions'
import { toast } from '../ui/use-toast'

const NewsletterSubscribers = ({emails}: {emails: string[]}) => {

    const path = usePathname();

   const handleUnsubscribe = async (index: number)=> {

    const userConfirmed = window.confirm(`Are you sure you want to unsubscribe this user? They will no longer receive newsletter messages`);
    if(userConfirmed)
    {

    const email =  emails[index]

    const unsubscribed =  await unsubscribeFromNewsletter(email, path);

    if(unsubscribed)
    {
        toast({
            title: "Success",
            description: `Unsubscribe user`, 
          })
    }else{
        toast({
            title: "Error",
            description: `Failed to unsubscribe user`, 
            variant: "destructive",
          })
    }

        }

   } 

  return (
    <>
     <h3 className="mx-auto text-heading4-bold font-semibold mb-2">Subscribed Emails</h3>
    <Card className='w-full max-w-lg mx-auto max-h-[200px] overflow-y-auto'>
    <div className="p-4">
    <div className="divide-y divide-gray-200">
      {emails.map((email: string, index: number) => (
        <div key={index} className="flex py-2">

          {email}
          <div className="ml-auto">
          <Button variant={"ghost"} onClick={() => {handleUnsubscribe(index)}}>
          <Image 
          src="/assets/delete.png"
          alt="delete icon"
          width={24}
          height={24}
          />
          </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
    </Card>
      <p className="w-full text-center text-subtle-semibold text-gray-400">scroll to view more</p>
      <div className="mx-auto">
        <Image 
          src="/assets/downarrow.png"
          alt="down arrow icon"
          width={24}
          height={24}
        />
        </div>
        </>
  )
}

export default NewsletterSubscribers