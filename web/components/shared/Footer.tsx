import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { footerNavLinks, footerSocials, storeDetails } from "@/lib/constants"
import SubscribeForm from "../forms/SubscribeForm"

const Footer = ()=> {

  return (
    <footer className=" w-full bg-black text-white py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {footerNavLinks.map((navLink, index) => (
              <div key={index}>
                <li key={index}>
                  <Link className="text-white cursor-pointer" href={`${navLink.link}`}>
                    {navLink.title}
                  </Link>
                </li>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h3 className=" font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            {footerSocials.map((social, index)=> (
              <div key={index}>
               <Link href={`${social.link}`} target="#blank">
               <Image
               src={`${social.icon}`}
               alt={`${social.title}`}
               width={24}
               height={24}
               className="h-6 w-6 hover:scale-150 duration-100 ease-out"
               />
             </Link>
             </div>
            ))}
          </div>
        </div>
       <SubscribeForm />
      </div>
      <div className="mt-8 text-center text-body-bold text-white">© 2024 {storeDetails.title} All rights reserved.</div>
    </footer>
  )
}

export default Footer;