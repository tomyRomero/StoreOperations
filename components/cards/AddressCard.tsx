"use client"

import React, { useState } from 'react';
import { CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import Image from 'next/image';
import { deleteAddress } from '@/lib/actions/store.actions';
import { usePathname } from 'next/navigation';
import { toast } from '../ui/use-toast';
import { Address } from '@/app/types/global';
import { useRouter } from 'next/navigation';


const AddressCard = ({ addresses , user}: { addresses: Address[] , user: string}) => {
  const router = useRouter();
  //pathname
  const path = usePathname();  

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Calculate the index of the last item to be displayed on the current page
  const indexOfLastItem = currentPage * itemsPerPage;

  // Calculate the index of the first item to be displayed on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the addresses array to get the addresses for the current page
  const currentAddresses = addresses.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete= async (address: Address)=> {
    try{
     const userConfirmed = window.confirm(`Are you sure you want to delete this address?`);
     if(userConfirmed)
     {
        const deleted =  await deleteAddress(user, address, path);

        if(deleted)
        {
            toast({
                title: "Success!",
                description: "Address Deleted", 
            })
            console.log("deleted")
        }else{
            toast({
                title: "Failed to Delete Address",
                description: "Something went wrong!", 
                variant: "destructive",
            })
            console.log("error")
        }
     }
    }catch(error)
    {
        toast({
            title: "Failed to Delete Address",
            description: `Something went wrong! Error: ${error}`, 
            variant: "destructive",
          })
        console.log(error)
    }
  }

  return (
    <CardContent>
      <div className="flex flex-col gap-4">
        {currentAddresses.map((addressData: Address, index: number) => (
          <div className="flex items-center gap-4" key={index}>
            <div className="flex flex-col">
              <div className="font-medium">{addressData.name}</div>
              <div>{addressData.address.line1}</div>
              <div>{addressData.address.line2}</div>
              <div>
                {addressData.address.city}, {addressData.address.state}{' '}
                {addressData.address.postal_code}
              </div>
              <div>{addressData.address.country}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={()=> { handleDelete(addressData)}}>
                <Image src="/assets/delete.png" alt="delete icon" width={24} height={24} />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className={`pagination ${addresses.length === 0 ? 'hidden' : ''}`}>
        <Button
          onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))}
          disabled={currentPage === 1}
          className="!text-small-regular text-light-2 bg-black"
        >
          Prev
        </Button>
        <p className="text-small-semibold text-black">{currentPage}</p>
        <Button
          onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
          disabled={indexOfLastItem >= addresses.length}
          className={`!text-small-regular text-light-2 bg-black`}
        >
          Next
        </Button>
      </div>
    </CardContent>
  );
};

export default AddressCard;


