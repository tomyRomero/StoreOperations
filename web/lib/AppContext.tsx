"use client"

import React, { createContext, useContext, ReactNode, useState } from 'react';

// Two flags some older components flip to ask each other to refresh. The cart has its own
// provider (components/cart/CartProvider.tsx).
type AppContextProps = {
  productAdjusted: boolean;
  setProductAdjusted: React.Dispatch<React.SetStateAction<boolean>>;

  pageChanged: boolean;
  setPageChanged: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [productAdjusted, setProductAdjusted] = useState(false);
  const [pageChanged, setPageChanged] = useState(false);

  return (
    <AppContext.Provider value={{ productAdjusted, setProductAdjusted, pageChanged, setPageChanged }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
