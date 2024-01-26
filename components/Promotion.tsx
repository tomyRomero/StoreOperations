"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface deal{
    id: string,
    image: string,
    product: string,
    description: string,
    oldprice: string,
    newprice: string
}

const Promotion = () => {
const deals= [{
    id: "egwrehtt",
    image: "/assets/sale.jpg",
    product: "Deal 1",
    description: "Brief description of the deal.",
    oldprice: "$70.99",
    newprice: "$49.99"
    }]

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

  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);

      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds });

      if (timeDifference === 0) {
        clearInterval(timerInterval);
        // You can add code here to handle what happens when the target date is reached.
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval); // Cleanup the interval when the component unmounts.
    };
  }, []);

  return (
    <section className="px-20 lg:px-40 mt-10 mx-auto grid grid-cols-1 gap-6 md:gap-0 mb-6 md:mb-0">
    <div className="flex flex-col justify-center gap-6 p-6 bg-gradient-to-r from-green-400 to-blue rounded-lg shadow-lg text-white">
      <div>
        <h3 className="text-heading3-bold">Deals of the Month</h3>
        <p className='text-body-semibold'>
          Discover Deals like never before with our Deals of the Month! Every Sale comes with
          exclusive offers and perks. Don't miss out!
        </p>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatBox label="Days" value={time.days} />
        <StatBox label="Hours" value={time.hours} />
        <StatBox label="Minutes" value={time.minutes} />
        <StatBox label="Seconds" value={time.seconds} />
      </ul>
    </div>
    <div className="mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal: deal) => (
           <div key={deal.id} className="rounded-lg shadow-lg overflow-hidden">
           <Image
             alt="Deal Image"
             className="w-full h-64 object-cover"
             height="300"
             src={`${deal.image}`}
             style={{
               aspectRatio: "500/300",
               objectFit: "cover",
             }}
             width="500"
           />
           <div className="p-6">
             <h3 className="font-bold">{deal.product} <span className='text-red-500 line-through'> {deal.oldprice}</span> <span className='text-green-500'> {deal.newprice}</span> </h3>
             <p className="text-gray-500">{deal.description}</p>
             <Link
               className={`inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-medium text-gray-50 
               shadow transition-colors hover:bg-white  hover:text-black focus-visible:outline-none 
                mt-4`}
               href="#"
             >
               Learn more
             </Link>
           </div>
         </div>
        ))}
    </div>
    <div className='mt-6'>
    <ul className="grid grid-cols-2 justify-center gap-10 md:gap-0 lg:grid-cols-4 my-10 md:my-0">
          {inclusions.map((inclusion, index) => (
            <div className='md:p-4 lg:p-8'>
            <li key={index} className="text-center">
              <Image
                src={inclusion.icon}
                alt={inclusion.title}
                width={46}
                height={46}
                className="mb-4 mx-auto"
              />
              <h5 className="text-heading3-bold mb-2">{inclusion.title}</h5>
              <p className='text-body-semibold'>{inclusion.description}</p>
            </li>
            </div>
          ))}
        </ul>
        </div>
  </section>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
    <li className="border-2 border-black rounded-lg p-4 text-center">
      <h4 className="font-bold">{value}</h4>
      <p>{label}</p>
    </li>
  );
  

export default Promotion;


