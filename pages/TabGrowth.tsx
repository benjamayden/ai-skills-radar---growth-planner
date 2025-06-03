import React from "react";
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
}) => (
  <div className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
    <div className="space-y-6">
      <FocusSkillsSelector
        skills={identifiedSkills}
        selectedSkills={focusSkills}
        onSkillToggle={onSkillToggleFocus}
      />
      {!isProcessingGrowth && suggestedJobTitles.length > 0 && (
        <div className="results-section-jobs suggested-jobs-print">
          <SuggestedJobs jobTitles={suggestedJobTitles} />
        </div>
      )}
    </div>
    <div className="space-y-6">
      <button
        onClick={handleGenerateGrowthPlansAndJobs}
        disabled={focusSkills.length === 0 || isProcessingGrowth || !genAI}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out print-hide"
      >
        {isProcessingGrowth ? "Generating..." : "Generate Growth Plans & Job Suggestions"}
      </button>
      {isProcessingGrowth && <LoadingIndicator message={loadingMessage} />}
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
      {!isProcessingGrowth && focusSkills.length > 0 && growthPlans.length === 0 && suggestedJobTitles.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
          Select focus skills and click "Generate" to see your growth plan and job suggestions. {!genAI && "API Key needed."}
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

export default TabGrowth;
