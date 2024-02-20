"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DealCard from '../cards/DealCard';
import { promotionInclusions } from '@/lib/constants';

interface Deal {
  stripeProductId: string;
  name: string;
  description: string;
  stock: string;
  price: string;
  category: string;
  photo: string;
  date: string;
  oldPrice: string; 
  dealDescription: string; 
}

const Promotion = ({ deals }: { deals: Deal[] }) => {



  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate target date for the end of the current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Last day of the current month
  const targetDate = new Date(currentYear, currentMonth, lastDayOfMonth);

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
    <section className="max-xs:px-4 max-sm:px-8 px-20 lg:px-40 mt-10 mx-auto grid grid-cols-1 gap-6 md:gap-0 mb-6 md:mb-0">
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
        <StatBox  label="Hours" value={time.hours} />
        <StatBox label="Minutes" value={time.minutes} />
        <StatBox  label="Seconds" value={time.seconds} />
      </ul>
    </div>
    <div className="mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal: Deal, index) => (
         <DealCard key={index} id={deal.stripeProductId} photo={deal.photo} name={deal.name} oldPrice={deal.oldPrice} price={deal.price} dealDescription={deal.dealDescription} />
        ))}
    </div>
    <div className='mt-6'>
    <ul className="grid max-sm:grid-cols-1 grid-cols-2 justify-center gap-10 md:gap-0 lg:grid-cols-4 my-10 md:my-0">
          {promotionInclusions.map((inclusion, index) => (
            <div className='md:p-4 lg:p-8' key={index}>
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

const StatBox = ({ label, value}: { label: string; value: number }) => (
    <li className="border-2 border-black rounded-lg p-4 text-center">
      <h4 className="font-bold">{value}</h4>
      <p>{label}</p>
    </li>
  );
  

export default Promotion;


