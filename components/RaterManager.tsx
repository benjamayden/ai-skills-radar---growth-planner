
import React, { useState } from 'react';
import { Rater, SELF_ASSESSMENT_RATER_ID } from '../types';

interface RaterManagerProps {
  raters: Rater[];
  activeRaterId: string;
  onAddRater: (name: string) => void;
  onSelectRater: (raterId: string) => void;
  disabled?: boolean;
  className?: string;
  comparisonRaterIds: string[];
  onToggleComparisonRater: (raterId: string) => void;
  showAverageOnRadar: boolean;
  onToggleShowAverage: () => void;
}

const RaterManager: React.FC<RaterManagerProps> = ({ 
  raters, 
  activeRaterId, 
  onAddRater, 
  onSelectRater, 
  disabled, 
  className,
  comparisonRaterIds,
  onToggleComparisonRater,
  showAverageOnRadar,
  onToggleShowAverage
}) => {
  const [newRaterName, setNewRaterName] = useState('');

  const handleAddClick = () => {
    if (newRaterName.trim()) {
      onAddRater(newRaterName.trim());
      setNewRaterName('');
    }
  };

  const selectableForAverage = comparisonRaterIds.length >= 2;

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Section 1: Active Rater for Editing & Adding New Raters */}
        <div className="space-y-4">
          <div>
            <label htmlFor="rater-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currently Rating As (for Rubrics):
            </label>
            <select
              id="rater-select"
              value={activeRaterId}
              onChange={(e) => onSelectRater(e.target.value)}
              disabled={disabled}
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

        {/* Section 2: Radar Chart Display Options */}
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2 border-t pt-3 md:border-t-0 md:pt-0">Radar Chart Display:</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select raters to compare:</p>
            {raters.map(rater => (
              <label key={rater.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparisonRaterIds.includes(rater.id)}
                  onChange={() => onToggleComparisonRater(rater.id)}
                  disabled={disabled || (rater.id === SELF_ASSESSMENT_RATER_ID && comparisonRaterIds.length === 1 && comparisonRaterIds.includes(SELF_ASSESSMENT_RATER_ID))} // Prevent deselecting self if it's the only one selected
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{rater.name} {rater.isSelf ? "(Self)" : ""}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center space-x-2 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={showAverageOnRadar}
              onChange={onToggleShowAverage}
              disabled={disabled || !selectableForAverage}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className={`text-sm ${selectableForAverage ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
              Show Average Line (min. 2 raters)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RaterManager;
