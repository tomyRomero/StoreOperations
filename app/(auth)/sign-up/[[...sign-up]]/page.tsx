"use client"

import { Button } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import {useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* Section for XL screens */}
      <div className="hidden lg:block" style={{ backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: "url('/assets/art.jpg')" }}>
      </div>

      {/* Section for Large and medium screens */}
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="max-w-2xl w-full p-8 max-lg:bg-[url('/assets/art.jpg')] bg-cover bg-no-repeat bg-center">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-heading1-bold text-black text-center">Welcome To Palette Hub!</h3>
            <Image src="/assets/icon.png" alt="logo" width={30} height={30} className="bg-white rounded-full" />
            <Button className="flex sm:px-6 xs:px-2.5 py-3 bg-black rounded-lg hover:text-black hover:bg-white" 
            onClick={()=> {router.push("/")}}>
                Home
            </Button>
            <p className="text-white text-center max-md:hidden">Please Sign Up Here</p>
            <div className="max-xs:m-0 ml-4">
            <SignUp />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
