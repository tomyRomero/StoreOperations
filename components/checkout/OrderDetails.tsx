import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Loading from '@/app/(auth)/loading';
import { Skeleton } from '../ui/skeleton';
import { findProduct } from '@/lib/actions/store.actions';
import { getRes } from '@/lib/s3';
import { Button } from '../ui/button';

interface Items {
  items: {
    product: string;
    quantity: number;
  }[];
}

const OrderItem = ({ product, quantity }: { product: string; quantity: number }) => {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState('/assets/image.png');
  const [name, setName] = useState('Product not found');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const data = await findProduct(product);

      if (data) {
        setImage(await getRes(data.photo));
        setName(data.name);
        setPrice(data.price);
      }

      setLoading(false);
    };

    getData();
  }, []);

  return (
    <>
      {loading ? (
        <div className="mt-5 flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <div className="grid items-start">
            <div className="flex items-start">
              <Image
                alt="Product Image"
                className="aspect-square object-cover border border-gray-200 rounded-lg w-24 overflow-hidden dark:border-gray-800"
                height={120}
                src={image}
                width={120}
              />
              <div className="grid gap-0.5 ml-2.5">
                <h3 className="font-bold">{name}</h3>
                <div className="flex gap-5 ">
                  <p className="justify-start leading-none">x{quantity}</p>
                  <p className="justify-end ml-auto leading-none">${(price * quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OrderDetails = ({ items }: Items) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentOrderItems = items.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="grid gap-4 items-start">
      <h2 className="text-heading3-bold font-bold">Order Details</h2>
      <div className="grid gap-4">
        {currentOrderItems.map((orderItem) => (
          <OrderItem key={orderItem.product} product={orderItem.product} quantity={orderItem.quantity} />
        ))}
      </div>
      <div className="pagination">
        <Button onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))} disabled={currentPage === 1}>
          Prev
        </Button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <Button onClick={() => setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))} disabled={indexOfLastItem >= items.length}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;
