"use client"

import React from 'react';

interface RadioButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onRadioChange: (value: string) => void;
  groupName: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  isSelected,
  onRadioChange,
  groupName,
}) => {
  const handleRadioChange = () => {
    onRadioChange(value);
  };

  return (
    <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
      <input
        type="radio"
        checked={isSelected}
        onChange={handleRadioChange}
        className=" w-6 h-6 rounded-full border-2 border-black outline-none cursor-pointer"
        name={groupName}
      />
      {label}
    </label>
  );
};
