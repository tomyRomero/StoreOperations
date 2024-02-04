"use client"

// Import necessary React modules
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { syncLocalStorageWithServerCart } from './actions/store.actions';
import { useSession } from 'next-auth/react';

// Define the types for the context
type AppContextProps = {
  // Define state and methods here
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any>>;

  productAdjusted: boolean;
  setProductAdjusted: React.Dispatch<React.SetStateAction<any>>;


};

// Create the AppContext with an initial value of undefined
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Create the AppProvider component that will wrap your application
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize the state using the useState hook

  //Global cart array state synced with local storage, if local storage fails state still runs
  const [cart, setCart] = useState(() => {
    // Check to see if localStorage is supported
     if (typeof window !== 'undefined' && window.localStorage) {
      //Check to see if there is localstorage if not just set default as an empty array
      const localStorageCart = localStorage.getItem('cart');
      return localStorageCart ? JSON.parse(localStorageCart) : [];
    } else {
      return [];
    }
    
  });

  //Global marker that is called whenever an item in cart is updated, used for nav
  const [productAdjusted, setProductAdjusted] = useState(false);

  const { data: session } = useSession();

  useEffect(()=> {
    const syncLocalStorageWithServerCartClient = async (userId: string) => {
      // Perform local storage operations to see if it exists
      const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
      if (localStorageCart) {
        // Call the server-side function to handle server operations
        const syncResult = await syncLocalStorageWithServerCart(localStorageCart, userId);
    
        if (syncResult.success) {
          // Clear the local storage cart
          localStorage.removeItem('cart');
          console.log('Local storage cart cleared after successful synchronization.');
        } else {
          console.error('Failed to sync cart:', syncResult.message);
        }
      }
    };

    if(session)
    {
      syncLocalStorageWithServerCartClient(session.user.id);
    }
   
  }, [])

  // Provide the context value to the children components, include additional states if there are any
  const contextValue: AppContextProps = {
    cart, setCart,
    productAdjusted, setProductAdjusted
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Create a custom hook (useAppContext) to easily access the context
export const useAppContext = () => {
  // Use the useContext hook to access the AppContext
  const context = useContext(AppContext);

  // Throw an error if the hook is not used within an AppProvider
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  // Return the context value
  return context;
};
