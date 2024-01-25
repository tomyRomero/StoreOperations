
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const Footer = () => {
  const navItems = [
    {
        icon: "/assets/instagram.png",
        label: "instagram icon",
        link: "https://www.instagram.com/"
    },
    {
        icon: "/assets/twitter.png",
        label: "twitter icon",
        link: "https://twitter.com/"
    },
    {
        icon: "/assets/facebook.png",
        label: "facebook icon",
        link: "https://www.facebook.com/"
    }
  ];

  const inclusions = [
    {
        title: "Free Shipping",
        icon: "/assets/box.png",
        description: "Free shipping for order above $150"
    },
    {
        title: "Money Guarantee",
        icon: "/assets/dollar.png",
        description: "Within 30 days for an exchange"
    },
    {
        title: "Online Support",
        icon: "/assets/support.png",
        description: "24 hours a day, 7 days a week"
    },
    {
        title: "Flexible Payment",
        icon: "/assets/card.png",
        description: "Pay with multiple credit cards"
    }

  ];

  return (
    <footer className={`relative mt-14`}>
        <ul className="grid justify-center gap-8 md:gap-0 md:grid-cols-4 my-10 md:my-0">
          {inclusions.map((inclusion, index) => (
            <li key={index} className="text-center">
              <Image
                src={inclusion.icon}
                alt={inclusion.title}
                width={36}
                height={36}
                className="mb-4"
              />
              <h5 className="text-lg font-semibold mb-2">{inclusion.title}</h5>
              <p>{inclusion.description}</p>
            </li>
          ))}
        </ul>

      <div className=" py-8">
     
          <div className="flex justify-between items-center flex-wrap gap-2 md:gap-4">
            <Link href="/">
              <h1>PaletteHub.</h1>
            </Link>
            <p className="text-sm">@2024 PaletteHub All rights reserved</p>
            <div className="flex gap-4">
              {navItems.map((item, index) => {
                return (
                  <Link
                    key={index}
                    href={item.link}
                    target="_blank"
                    className="w-6 h-6"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
