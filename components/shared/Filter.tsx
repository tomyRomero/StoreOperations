"use client"

import React, { useEffect, useState } from 'react';
import { RadioButton } from './Radio';
import { Checkbox } from './Checkbox';
import { useAppContext } from '@/lib/AppContext';

interface Category{
  id: string,
  title: string
}

const Filters = ({serverProducts, categoriesList} : any) => {

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("lowest");

  const {globalProducts, setGlobalProducts} = useAppContext();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories((prevCategories) => {
      if (prevCategories.includes(categoryId)) {
        return prevCategories.filter((id) => id !== categoryId);
      } else {
        return [...prevCategories, categoryId];
      }
    });
  };

  const filterProductsByCategories = () => {
    // Check if there are no selected categories
    if (selectedCategories.length === 0) {
      // If no categories selected, return the entire serverProducts array
      setGlobalProducts(serverProducts);
    } else {
      // Filter products based on selected categories
      const filtered = serverProducts.filter((product: any) =>
        selectedCategories.includes(product.category)
      );
  
      // Set the filtered products to state
      setGlobalProducts(filtered);
    }
  };
  
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
  };

  // Sort products from lowest to highest price
  const sortProductsByLowestPrice = (products: any) => {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    setGlobalProducts(sorted)
  };

  // Sort products from highest to lowest price
  const sortProductsByHighestPrice = (products: any) => {
    const sorted = [...products].sort((a, b) => b.price - a.price);
    setGlobalProducts(sorted)
  };

  useEffect(() => {
    filterProductsByCategories();

    if(selectedCategories.length > 0)
    {
      if(selectedSort === "lowest")
      {
        sortProductsByLowestPrice(globalProducts)
      }else if(selectedSort === "highest")
      {
        sortProductsByHighestPrice(globalProducts)
      }

    }else{

      if(selectedSort === "lowest")
      {
        sortProductsByLowestPrice(serverProducts)
      }else if(selectedSort === "highest")
      {
        sortProductsByHighestPrice(serverProducts)
      }

    }
    

  }, [selectedCategories, selectedSort]);

  
  return (
    <div className="flex flex-col gap-20 md:flex-row md:gap-40 md:mt-16 ">
      <div>
        <h6 className="whitespace-nowrap text-heading4-bold">Product Categories</h6>
        <div className="flex flex-col gap-4 md:flex-row mt-4 xl:flex-col">
          {categoriesList?.map((category: Category) => {
            return (
              <Checkbox
                key={category.id}
                label={category.title}
                value={category.id}
                isSelected={selectedCategories.includes(category.title)}
                onClickHandler={() => handleCategoryClick(category.title)}
              />
            );
          })}
        </div>
        <br />
        <div className="border-t border-black"></div>
        <br />
        <h6 className="whitespace-nowrap text-heading4-bold">Sort By</h6>
        <div className="flex gap-4 flex-col md:flex-row mt-4 xl:flex-col">
          <RadioButton
            label="Lowest"
            value="Lowest"
            isSelected={selectedSort === "lowest"}
            onRadioChange={() => handleSortChange("lowest")}
            groupName="sort"
          />
          <RadioButton
            label="Highest"
            value="Highest"
            isSelected={selectedSort === "highest"}
            onRadioChange={() => handleSortChange("highest")}
            groupName="sort"
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
