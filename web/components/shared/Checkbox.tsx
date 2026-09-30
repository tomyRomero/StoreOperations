import React, { ChangeEvent, useState } from 'react';

interface CheckboxProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClickHandler: (value: string) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, value, isSelected, onClickHandler }) => {
  // State to track whether the checkbox is checked or not
  const [isChecked, setIsChecked] = useState(isSelected);

  // Event handler for checkbox change
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Update the state to reflect the new checked status
    setIsChecked(e.target.checked);
    // Call the onClickHandler provided by the parent component with the checkbox value
    onClickHandler(value);
  };

  // Render the checkbox input and label
  return (
    <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className={`w-6 h-6 rounded-md border-2 border-black outline-none cursor-pointer accent-black`}
        
      />
      {label}
    </label>
  );
};
