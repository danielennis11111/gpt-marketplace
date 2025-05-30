import React from 'react';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  isGridView: boolean;
  onToggle: () => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isGridView, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
    >
      {isGridView ? (
        <>
          <ListBulletIcon className="w-5 h-5" />
          <span>List View</span>
        </>
      ) : (
        <>
          <Squares2X2Icon className="w-5 h-5" />
          <span>Grid View</span>
        </>
      )}
    </button>
  );
};

export default ViewToggle; 