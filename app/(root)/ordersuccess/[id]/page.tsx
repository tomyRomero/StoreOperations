import { Button } from "@/components/ui/button"
import Image from "next/image";

const page = ()=> {
  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <div className="mx-auto max-w-2xl p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <Image 
            src={"/assets/checkmark.png"}
            alt={"checkmark logo"}
            width={34}
            height={34}
          />
          <h1 className="text-2xl font-semibold">Purchase Successful!</h1>
        </div>
        <p className="mt-2 text-center text-gray-600">Thank you for your purchase. Your order details are below.</p>
      </div>
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">123456789</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Items Purchased:</span>
            <span className="font-medium">3</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">$150.00</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600">Delivery Address:</span>
            <span className="font-medium">
              1234 Main St.
              <br />
              Anytown, CA 12345
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="mt-8 max-w-md h-12">
          Continue Shopping
        </Button>
        <Button className="mt-8 max-w-md h-12">
          View Orders
        </Button>
      </div>
      <p className="mt-4 text-center text-gray-600">A confirmation email has been sent to your email address.</p>
    </section>
  )
}

export default page;

