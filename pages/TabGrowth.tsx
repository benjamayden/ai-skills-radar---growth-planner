import React, { useState } from "react";
import FocusSkillsSelector from "../components/FocusSkillsSelector";
import SuggestedJobs from "../components/SuggestedJobs";
import GrowthPlanDisplay from "../components/GrowthPlanDisplay";
import LoadingIndicator from "../components/LoadingIndicator";
import { IdentifiedSkillData, GrowthPlan } from "../types";

interface TabGrowthProps {
  identifiedSkills: IdentifiedSkillData[];
  focusSkills: string[];
  onSkillToggleFocus: (skillId: string) => void;
  isProcessingGrowth: boolean;
  suggestedJobTitles: string[];
  growthPlans: GrowthPlan[];
  loadingMessage: string;
  handleGenerateGrowthPlansAndJobs: () => void;
  genAI: any;
}

const TabGrowth: React.FC<TabGrowthProps> = ({
  identifiedSkills,
  focusSkills,
  onSkillToggleFocus,
  isProcessingGrowth,
  suggestedJobTitles,
  growthPlans,
  loadingMessage,
  handleGenerateGrowthPlansAndJobs,
  genAI,
}) => {
  // State to track if focus selector should be shown
  // Show selector by default if there are no growth plans or not enough focus skills
  const [showFocusSelector, setShowFocusSelector] = React.useState(
    growthPlans.length === 0 || focusSkills.length === 0
  );
  
  // No longer needed as we're handling this in handlePrimaryAction
  
  // Wrapper for skill toggle that also makes sure the selector remains visible
  const handleSkillToggle = (skillId: string) => {
    // Check if this is the last skill being removed
    const isRemovingLastSkill = 
      focusSkills.length === 1 && focusSkills.includes(skillId);
    
    // Call the parent toggle function
    onSkillToggleFocus(skillId);
    
    // Keep the selector visible when toggling skills
    setShowFocusSelector(true);
    
    // If we're removing the last skill and have growth plans, show "Update Focus" button
    if (isRemovingLastSkill && growthPlans.length > 0) {
      // We'll keep focus selector visible to allow selecting new skills
    }
  };
  
  // Primary button action
  const handlePrimaryAction = () => {
    if (!showFocusSelector) {
      // If focus selector is hidden, show it regardless of whether growth plans exist
      setShowFocusSelector(true);
    } else if (focusSkills.length > 0) {
      // If focus selector is visible and we have skills selected, generate growth plans
      handleGenerateGrowthPlansAndJobs();
      // Hide the focus selector after generating (it will reappear if user clicks "Update Focus")
      setShowFocusSelector(false);
    }
    // If focus selector is visible but no skills selected, button will be disabled
  };
  
  // Function to hide the focus selector (cancel)
  const handleHideFocusSelector = () => {
    // Only allow hiding if we have valid focus skills selected
    if (focusSkills.length > 0) {
      setShowFocusSelector(false);
    }
  };

  // Side effect: After processing growth, hide the focus selector if plans were generated
  React.useEffect(() => {
    if (!isProcessingGrowth && growthPlans.length > 0) {
      setShowFocusSelector(false);
    }
  }, [isProcessingGrowth, growthPlans.length]);

  // Determine button style and text based on state
  const isPrimaryButton = showFocusSelector;
  const buttonText = isProcessingGrowth 
    ? "Generating..."
    : (!showFocusSelector && growthPlans.length > 0)
      ? "Update Focus" 
      : "Generate Growth Plans & Job Suggestions";
  
  const buttonStyle = isPrimaryButton
    ? "w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out print-hide"
    : "w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out print-hide";

  return (
  <div className={`grid ${showFocusSelector ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 p-4`}>
    {/* Focus Skills Column - only visible when showFocusSelector is true */}
    {showFocusSelector && (
      <div className="space-y-6 transition-all duration-300 ease-in-out">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Focus Skills</h3>
            {focusSkills.length > 0 && (
              <button
                onClick={handleHideFocusSelector}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Done
              </button>
            )}
          </div>
          <FocusSkillsSelector
            skills={identifiedSkills}
            selectedSkills={focusSkills}
            onSkillToggle={handleSkillToggle}
          />
        </div>
      </div>
    )}
    {/* Results Column - always visible */}
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrimaryAction}
          disabled={
            (showFocusSelector && focusSkills.length === 0) || // Disable when selector is shown but no skills selected
            isProcessingGrowth || 
            !genAI
          }
          className={`${buttonStyle} ${!showFocusSelector ? 'w-full' : ''}`}
        >
          {buttonText}
        </button>
        
        {/* When showing "Update Focus" and we have focus skills, show selected count */}
        {!showFocusSelector && focusSkills.length > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {focusSkills.length} skill{focusSkills.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {isProcessingGrowth && <LoadingIndicator message={loadingMessage} />}
      {!isProcessingGrowth && suggestedJobTitles.length > 0 && (
        <div className="results-section-jobs suggested-jobs-print">
          <SuggestedJobs jobTitles={suggestedJobTitles} />
        </div>
      )}
      {!isProcessingGrowth && growthPlans.length > 0 && (
        <div className="results-section-growth-plans">
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-8">
            Personalized Growth Plans
          </h3>
          {growthPlans.map((plan, index) => (
            <div key={index} className="growth-plan-display-item-print">
              <GrowthPlanDisplay growthPlans={[plan]} />
            </div>
          ))}
        </div>
      )}
      {!isProcessingGrowth &&
        focusSkills.length > 0 &&
        growthPlans.length === 0 &&
        suggestedJobTitles.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Select focus skills and click "Generate" to see your growth plan and
            job suggestions. {!genAI && "API Key needed."}
          </p>
        )}
      {identifiedSkills.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          Please generate skills from the "My Details" tab first.
        </p>
      )}
    </div>
  </div>
  );
};

export default TabGrowth;
