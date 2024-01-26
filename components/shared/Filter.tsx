"use client"

import React, { useState } from 'react';
import { RadioButton } from './Radio';
import { Checkbox } from './Checkbox';


const Filters = () => {
  const categoriesList = [
    {
      id: "1",
      media: "/assets/categories/canvas.jpg",
      title: "Canvases"
    },
    {
      id: "2",
      media: "/assets/categories/brushes.jpg",
      title: "Brushes"
    },
    {
      id: "3",
      media: "/assets/categories/paint.jpg",
      title: "Paint"
    },
  ];

  const products = [
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
    {
      title: "Product 1",
      id: "1234",
      image: "/assets/art.jpg",
      price: 24.99, 
      category: "Brushes"
    },
  ]

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("-createdAt");

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

  return (
    <div className="flex flex-col gap-20 md:flex-row md:gap-40 md:mt-16 ">
      <div>
        <h6 className="whitespace-nowrap text-heading4-bold">Product Categories</h6>
        <div className="flex flex-col gap-4 md:flex-row mt-4 xl:flex-col">
          {categoriesList.map((category) => {
            return (
              <Checkbox
                key={category.id}
                label={category.title}
                value={category.id}
                isSelected={selectedCategories.includes(category.id)}
                onClickHandler={() => handleCategoryClick(category.id)}
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
            label="Latest"
            value="-createdAt"
            isSelected={selectedSort === "-createdAt"}
            onRadioChange={() => handleSortChange("-createdAt")}
            groupName="sort"
          />
          <RadioButton
            label="Highest"
            value="Lowest"
            isSelected={selectedSort === "Price"}
            onRadioChange={() => handleSortChange("Price")}
            groupName="sort"
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
