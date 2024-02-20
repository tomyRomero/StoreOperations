
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function page() {
  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-heading4-bold font-semibold">Store Information</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Store Address:</span>
              <span className="font-medium">
                1234 Main St.
                <br />
                Anytown, CA 12345
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Contact Information:</span>
              <span className="font-medium">
                Phone: (123) 456-7890
                <br />
                Email: info@example.com
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Store Hours:</span>
              <span className="font-medium">
                Monday - Friday: 9:00 AM - 6:00 PM
                <br />
                Saturday: 10:00 AM - 4:00 PM
                <br />
                Sunday: Closed
              </span>
            </div>
              </div>
            </div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-heading4-bold tracking-tighter pt-4">Contact Us</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Enter your first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Enter your last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter your subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea className="min-h-[100px]" id="message" placeholder="Enter your message" />
            </div>
            <div className="py-2">
            <Button
            className="bg-black text-white border border-black"
            variant={"ghost"}
            >
            Submit
            </Button>
            </div>
            <br/>
          </div>
          
        </div>
    
      </div>
    </section>
  )
}

