"use client"

import React, { useEffect, useRef, useState } from 'react';
import { RadioButton } from './Radio';
import { Checkbox } from './Checkbox';
import { useRouter } from 'next/navigation';

interface Category{
  id: string,
  title: string
}

interface Props{
  categoriesList: Category[],
  categoryParams: string[],
  sortParams: string
}

const Filters = ({categoriesList, categoryParams, sortParams}: Props) => {

  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParams);
  const [selectedSort, setSelectedSort] = useState<string>(sortParams? sortParams : "lowest");

  const router = useRouter()

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories((prevCategories) => {
      if (prevCategories.includes(categoryId)) {
        return prevCategories.filter((id) => id !== categoryId);
      } else {
        return [...prevCategories, categoryId];
      }
    });
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
  };

  const isMounted = useRef(true);

  useEffect(() => {
    // Skip the effect on initial render
      if (isMounted.current) {
        isMounted.current = false;
        return;
      }

    // query after 0.3s of no input
      const delayDebounceFn = setTimeout(() => {
      // Create a new URLSearchParams object
      const params = new URLSearchParams();  

      // Add categories to the query parameters as a single parameter with comma-separated values
      params.append('categories', selectedCategories.join(','));

      // Add the "sorted" parameter to the URLSearchParams
      params.append('sorted', selectedSort);

      // Get the final query string
      const queryString = params.toString();

      // Now you can include the queryString in your API request
      const url = `/products?${queryString}`;

      router.push(url)

    }, 300);

    return () => clearTimeout(delayDebounceFn);

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
