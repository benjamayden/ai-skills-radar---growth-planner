
import React, { useState } from 'react';
import { Rater } from '../types';

interface RaterManagerProps {
  raters: Rater[];
  activeRaterId: string;
  onAddRater: (name: string) => void;
  onSelectRater: (raterId: string) => void;
  disabled?: boolean;
  className?: string; // Added className prop
}

const RaterManager: React.FC<RaterManagerProps> = ({ raters, activeRaterId, onAddRater, onSelectRater, disabled, className }) => {
  const [newRaterName, setNewRaterName] = useState('');

  const handleAddClick = () => {
    if (newRaterName.trim()) {
      onAddRater(newRaterName.trim());
      setNewRaterName('');
    }
  };

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6 ${className || ''}`}>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Manage Raters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="rater-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currently Rating As:
          </label>
          <select
            id="rater-select"
            value={activeRaterId}
            onChange={(e) => onSelectRater(e.target.value)}
            disabled={disabled}
            // Added text-gray-900 for light mode. Added dark:disabled:text-gray-400
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
          >
            {raters.map((rater) => (
              <option key={rater.id} value={rater.id}>
                {rater.name} {rater.isSelf ? "(Self)" : ""}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="new-rater-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add New Rater:
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="new-rater-name"
              value={newRaterName}
              onChange={(e) => setNewRaterName(e.target.value)}
              placeholder="e.g., Manager, Peer John"
              disabled={disabled}
              // Added text-gray-900 and placeholder-gray-500 for light mode. Added dark:disabled:text-gray-400
              className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={disabled || !newRaterName.trim()}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaterManager;
