import React from 'react'
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"


const NewsletterForm = () => {
  return (
    <Card className="w-full max-w-lg mx-auto">
    <CardHeader>
      <CardTitle className="text-heading3-bold">New message to all subscribed to newsletter</CardTitle>
      <CardDescription>Enter the details of your message below.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Enter the title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea className="min-h-[150px]" id="message" placeholder="Enter your message" />
      </div>
    </CardContent>
    <CardFooter>
      <div className="mx-auto">
      <Button className="bg-black text-white border border-black" variant={"ghost"}>
        Send message
      </Button>
      </div>
    </CardFooter>
  </Card>
  )
}

export default NewsletterForm