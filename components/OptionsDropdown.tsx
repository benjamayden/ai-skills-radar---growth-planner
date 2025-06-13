import React, { useState, useRef, useEffect } from 'react';

interface OptionsDropdownProps {
  onExport: () => void;
  onImport: () => void;
  onStartOver: () => void;
  onPrintRadar?: () => void;
  disabled?: {
    export?: boolean;
  };
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  onExport,
  onImport,
  onStartOver,
  onPrintRadar,
  disabled = {}
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

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative print-hide" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white 
                   hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Options menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                       border border-gray-200 dark:border-gray-600 z-50 py-2">
          
          {onPrintRadar && (
            <button
              onClick={() => handleMenuAction(onPrintRadar)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
            >
              <span>📊</span>
              Print Radar & Rubrics
            </button>
          )}

          <button
            onClick={() => handleMenuAction(onExport)}
            disabled={disabled.export}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 
                     hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center gap-3"
          >
            <span>📤</span>
            Export Data (JSON)
          </button>

          <button
            onClick={() => handleMenuAction(onImport)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 
                     hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
          >
            <span>📥</span>
            Import Data (JSON)
          </button>

          <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>

          <button
            onClick={() => handleMenuAction(onStartOver)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 
                     hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
          >
            <span>🔄</span>
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default OptionsDropdown;
