"use client"

import { motion as m, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


interface Props {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

export default function NavMenu({ isActive, setIsActive }: Props) {

const { data: session } = useSession();

const router = useRouter(); 


  const navLinks = session? [
    {
        title: "Home",
        path: "/", 
        image: "/assets/layout.png"
    },
    {
        title: "Shop",
        path: "/products", 
        image: "/assets/price.png"
    },
    {
        title: "Account",
        path: "/account",
        image: "/assets/profile.png"
    },
    {
        title: "Logout",
        path: "/logout",
        image: "/assets/logout.png"
    }
  ] : [
    {
        title: "Home",
        path: "/", 
        image: "/assets/layout.png"
    },
    {
        title: "Shop",
        path: "/products", 
        image: "/assets/price.png"
    },
    {
        title: "Login",
        path: "/login",
        image: "/assets/login.png"
    },
  ]

  const pathname = usePathname();

  const handleNav = (link: string)=> {
    setIsActive(false)
    if(link === "/login")
    {
        // Set data in sessionStorage so user can navigate back to exact page after loggin in
        sessionStorage.setItem('path', pathname);
        signIn()
    }else if(link === "/logout")
    {
        signOut({
            redirect: true,
            callbackUrl: `${pathname}`
        })
    }
    else{
        router.push(link)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <m.article
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className={`absolute top-[77px] left-0 right-0 bg-white}`}
          >
            <div className="flex item-center justify-between max-w-custom mx-auto px-[24px] xl:px-[103px] md:pt-[75px] md:pb-[69px] py-[42px]">
              <nav className="flex flex-wrap lg:max-w-[880px] flex-col md:flex-row md:gap-x-[35px]">
              {navLinks.map((link, index) => (
                  <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      transition: { delay: index * 0.05 },
                    }}
                    transition={{ delay: index * 0.15 + 0.45 }}
                    key={link.title}
                  >
        
                    <button className="flex gap-2 items-center" onClick= {() => handleNav(link.path)}>
                        <Image
                          src={link.image}
                          alt={`${link.title} icon`}
                          width={34}
                          height={34}
                          className="px-1"
                        />
                        <h2
                        className={`hover:text-gray-500 transition-all 
                        duration-[500ms] md:text-[82px] text-[42px] tracking-[2.52px] font-bold uppercase md:tracking-[5.8px]
                        ${link.path === pathname ? "text-gray-500" : ""}
                        `}
                      >
                        {link.title}
                      </h2>
                    </button>
                    
                  </m.div>
                ))}
              </nav>
            </div>
          </m.article>
        )}
      </AnimatePresence>
    </>
  );
}
