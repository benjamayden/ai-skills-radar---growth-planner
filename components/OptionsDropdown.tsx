import React, { useState, useRef, useEffect } from 'react';

interface OptionsDropdownProps {
  onExportData: () => void;
  onStartOver: () => void;
  onPrintRadarAndRubrics: () => void;
  disabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  onExportData,
  onStartOver,
  onPrintRadarAndRubrics,
  disabled = false,
  fileInputRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all your data.')) {
      onStartOver();
    }
    setIsOpen(false);
  };

  const handleExportData = () => {
    onExportData();
    setIsOpen(false);
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handlePrintRadarAndRubrics = () => {
    onPrintRadarAndRubrics();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                   hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                   rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Options</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                       border border-gray-200 dark:border-gray-600 z-50 py-2">
          <button
            onClick={handlePrintRadarAndRubrics}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3
                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>🖨️</span>
            <span>Print Radar & Rubrics</span>
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
          
          <button
            onClick={handleExportData}
            disabled={disabled}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3
                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>📤</span>
            <span>Export Data (JSON)</span>
          </button>
          
          <button
            onClick={handleImportData}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3
                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>📥</span>
            <span>Import Data (JSON)</span>
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
          
          <button
            onClick={handleStartOver}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3
                       text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span>🔄</span>
            <span>Start Over</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OptionsDropdown;
