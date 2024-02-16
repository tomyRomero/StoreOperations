"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Card } from '../ui/card'

const ErrorMessage = () => {
    const router = useRouter();
    const handleBack = () => {
        router.back();
    }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
    
    <Button className="flex px-6 border border-black" variant="ghost" onClick = {handleBack}>
        <Image
          src="/assets/back.png"
          alt="go back icon"
          width={32}
          height={32}
          className="px-1"
        />
        <span className="ml-2">Go Back</span>
      </Button>

      <div className="flex justify-center py-6">
      <Card className="max-w-2xl p-6">
        <h1 className="text-red-500 text-heading4-bold">Item Was Not Found</h1>
        <br></br>
        <Image src="/assets/error.png" alt="error image"
          width={100}
          height={100}
          className="mx-auto"
        />
        <br></br>
        <p className="text-center">Try Refreshing Or Go Back</p>
      </Card>
      </div>
    </section>
  )
}

export default ErrorMessage;