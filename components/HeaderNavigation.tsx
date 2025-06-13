import React, { useState, useRef, useEffect } from 'react';
import { ActiveTabType, AppStep } from '../types';

// Temporary inline OptionsDropdown component
const OptionsDropdown: React.FC<{
  onExportData: () => void;
  onStartOver: () => void;
  onPrintRadarAndRubrics: () => void;
  disabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showPrintOption?: boolean;
}> = ({
  onExportData,
  onStartOver,
  onPrintRadarAndRubrics,
  disabled = false,
  fileInputRef,
  showPrintOption = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                   hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                   rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          {showPrintOption && (
            <>
              <button
                onClick={handlePrintRadarAndRubrics}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3
                           text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>🖨️</span>
                <span>Print Radar & Rubrics</span>
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
            </>
          )}
          
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

interface HeaderNavigationProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  currentStep: AppStep;
  onExportData: () => void;
  onStartOver: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  exportDisabled?: boolean;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  activeTab,
  onTabChange,
  currentStep,
  onExportData,
  onStartOver,
  fileInputRef,
  exportDisabled = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show navigation when in main view
  if (currentStep !== AppStep.MAIN_VIEW) {
    // Still show options dropdown even when not in main view, but hide Print option
    return (
      <OptionsDropdown
        onExportData={onExportData}
        onStartOver={onStartOver}
        onPrintRadarAndRubrics={() => {}} // Disabled when not in main view
        disabled={exportDisabled}
        fileInputRef={fileInputRef}
        showPrintOption={false}
      />
    );
  }

  // Main navigation tabs (only show the core functionality)
  const tabs = [
    { id: 'details' as ActiveTabType, label: 'My Details', icon: '📝', shortLabel: 'Details' },
    { id: 'radar' as ActiveTabType, label: 'Skills Radar', icon: '🎯', shortLabel: 'Radar' },
    { id: 'growth' as ActiveTabType, label: 'Focus Skills', icon: '🚀', shortLabel: 'Focus' },
  ];

  const handleTabChange = (tabId: ActiveTabType) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const handlePrintRadarAndRubrics = () => {
    // Switch to the radar and rubrics tab temporarily for printing
    onTabChange('radarAndRubrics');
    // Delay the print to allow the component to render
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
                       ${
                         activeTab === tab.id
                           ? 'bg-primary-600 text-white shadow-md'
                           : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                       }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            <span className="mr-2">{tab.icon}</span>
            <span className="hidden lg:inline">{tab.label}</span>
            <span className="lg:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden relative" ref={mobileMenuRef}>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                   hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                   rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-expanded={isMobileMenuOpen}
          aria-haspopup="true"
        >
          <span>{tabs.find(tab => tab.id === activeTab)?.icon}</span>
          <span>{tabs.find(tab => tab.id === activeTab)?.shortLabel}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                         border border-gray-200 dark:border-gray-600 z-50 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
                           ${
                             activeTab === tab.id
                               ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                               : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                           }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options Dropdown */}
      <OptionsDropdown
        onExportData={onExportData}
        onStartOver={onStartOver}
        onPrintRadarAndRubrics={handlePrintRadarAndRubrics}
        disabled={exportDisabled}
        fileInputRef={fileInputRef}
        showPrintOption={true}
      />
    </div>
  );
};

export default HeaderNavigation;
