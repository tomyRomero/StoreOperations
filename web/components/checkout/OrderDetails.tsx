import React from 'react';
import Image from 'next/image';
import type { CheckoutLine } from '@/lib/api/types';
import { formatMoney } from '@/lib/money';

// What's being paid for, at the prices in the quote
const OrderDetails = ({ lines }: { lines: CheckoutLine[] }) => {
  return (
    <div className="grid gap-4 items-start">
      <h2 className="text-heading3-bold font-bold">Order Details</h2>
      <ul className="grid gap-4">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-start">
            <Image
              alt=""
              className="aspect-square object-cover border border-gray-200 rounded-lg w-24 overflow-hidden"
              height={120}
              src={line.imageUrl}
              width={120}
            />
            <div className="grid gap-0.5 ml-2.5 flex-1">
              <h3 className="font-bold">{line.name}</h3>
              <div className="flex gap-5">
                <p className="leading-none">x{line.quantity}</p>
                <p className="ml-auto leading-none">{formatMoney(line.lineTotalCents)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;
