import React from 'react';

interface FilterBarProps {
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, onCategoryChange }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 flex items-center">
      <input
        type="text"
        placeholder="Search GPTs..."
        className="p-2 border rounded-md w-full mr-2"
        onChange={(e) => onSearch(e.target.value)}
      />
      <select className="p-2 border rounded-md" onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Marketing">Marketing</option>
        <option value="Customer Service">Customer Service</option>
        <option value="Education">Education</option>
        <option value="Productivity">Productivity</option>
        {/* Add more categories as needed */}
      </select>
    </div>
  );
};

export default FilterBar; 