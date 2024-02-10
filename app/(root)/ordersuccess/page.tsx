import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {

  const session = await getServerSession(authOptions);

  if(!session)
  {
    redirect("/")
  }



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
        <p className="mt-2 text-center text-gray-600">
          Thank you for your purchase. You can now continue shopping or view your orders.
        </p>
      </div>
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Store Information</h2>
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
      <p className="mt-4 text-center text-gray-600">
        A confirmation email has been sent to your email address.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/products">
        <Button className="mt-8 max-w-md h-12">
          Continue Shopping
        </Button>
        </Link>
        <Link href="/account/orders">
        <Button className="mt-8 max-w-md h-12">
          View Orders
        </Button>
        </Link>
      </div>
    </section>
  );
};

export default Page;
