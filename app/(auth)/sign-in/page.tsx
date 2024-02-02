"use client"

import SignInForm from "@/components/forms/SignInForm";
import Image from "next/image";
import {useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* Section for XL screens and above */}
      <div className="hidden lg:block" style={{ backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: "url('/assets/auth.jpg')" }}>
        
      </div>
      {/* Section for Large and smaller screens */}
      <div className="flex flex-col justify-center items-center w-full h-full max-lg:bg-[url('/assets/auth.jpg')] bg-cover bg-no-repeat bg-center ">
        <div className="max-w-2xl w-full h-full p-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-heading1-bold text-center text-black bg-white p-1 rounded-xl">Welcome Back To Palette Hub!</h3>
            <Image src="/assets/icon.png" alt="logo" width={30} height={30} className="bg-white rounded-full" priority />
            <p className="text-white text-center max-lg:hidden">Login Here</p>
            <div className="max-xs:m-0 ml-4">
            <SignInForm /> 
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
