import React, { useState, useRef, useEffect } from 'react';
import { ActiveTabType, AppStep } from '../types';

interface HeaderNavigationProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  currentStep: AppStep;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  activeTab,
  onTabChange,
  currentStep
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
    return null;
  }

  const tabs = [
    { id: 'details' as ActiveTabType, label: 'My Details', icon: '📝', shortLabel: 'Details' },
    { id: 'radarAndRubrics' as ActiveTabType, label: 'Skills Radar & Rubrics', icon: '🎯', shortLabel: 'Radar' },
    { id: 'growth' as ActiveTabType, label: 'Growth Plan', icon: '🚀', shortLabel: 'Growth' },
    { id: 'development' as ActiveTabType, label: 'Development', icon: '📈', shortLabel: 'Dev' },
  ];

  const handleTabChange = (tabId: ActiveTabType) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 ml-6 print-hide" role="tablist">
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
      <div className="md:hidden ml-4 print-hide relative" ref={mobileMenuRef}>
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
    </>
  );
};

export default HeaderNavigation;
