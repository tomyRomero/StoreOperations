"use client"

import React, { ChangeEvent, useState } from 'react';

interface CheckboxProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClickHandler: (value: string) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, value, isSelected, onClickHandler }) => {
  const [isChecked, setIsChecked] = useState(isSelected);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    onClickHandler(value);
  };

  return (
    <label className="flex items-center gap-10 whitespace-nowrap cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="appearance-none w-6 h-6 rounded-md border-2 border-dark-500 outline-none cursor-pointer"
      />
      {label}
    </label>
  );
};
