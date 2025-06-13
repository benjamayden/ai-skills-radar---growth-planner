
import React, { useState } from 'react';
import { IdentifiedSkillData, RubricLevel, RUBRIC_LEVELS_ORDERED, Rubric, SkillStatus, SkillMasteryCheck } from '../types';
import SkillMasteryIndicator from './SkillMasteryIndicator';

// Helper functions for rubric level styling
const getRubricLevelColor = (rating: RubricLevel) => {
  switch (rating) {
    case RubricLevel.FOUNDATIONAL:
      return "text-red-600 dark:text-red-400";
    case RubricLevel.INTERMEDIATE:
      return "text-yellow-600 dark:text-yellow-400";
    case RubricLevel.ADVANCED:
      return "text-green-600 dark:text-green-400";
    case RubricLevel.EXPERT:
      return "text-purple-600 dark:text-purple-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const getRubricLevelText = (rating: RubricLevel) => {
  switch (rating) {
    case RubricLevel.FOUNDATIONAL:
      return "Foundational";
    case RubricLevel.INTERMEDIATE:
      return "Intermediate";
    case RubricLevel.ADVANCED:
      return "Advanced";
    case RubricLevel.EXPERT:
      return "Expert";
    default:
      return "Not Rated";
  }
};

// Mastery Swap Button Component
const MasterySwapButton: React.FC<{
  skillId: string;
  skillName: string;
  onSwapSkill: (removeSkillId: string, addSkillId: string) => void;
  getAvailableSkillsForSwap: () => IdentifiedSkillData[];
  getRatingForSkill?: (skillId: string) => RubricLevel | undefined;
  getAllRatingsSummaryForSkill?: (skillId: string) => string;
}> = ({ skillId, skillName, onSwapSkill, getAvailableSkillsForSwap, getRatingForSkill, getAllRatingsSummaryForSkill }) => {
  const [isSwapMode, setIsSwapMode] = useState(false);
  const availableSkills = getAvailableSkillsForSwap();

  if (availableSkills.length === 0) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        No skills available for swap
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsSwapMode(!isSwapMode)}
        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md 
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                 transition-colors duration-200"
      >
        {isSwapMode ? "Cancel Swap" : "Swap Skill"}
      </button>
      
      {isSwapMode && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                       border border-gray-200 dark:border-gray-600 z-50 p-3 max-h-64 overflow-y-auto">
          <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Replace "{skillName}" with:
          </h6>
          <div className="space-y-2">
            {availableSkills.map((swapSkill) => {
              const skillRating = getRatingForSkill ? getRatingForSkill(swapSkill.id) : undefined;
              const ratingsSummary = getAllRatingsSummaryForSkill ? getAllRatingsSummaryForSkill(swapSkill.id) : '';
              const hasRatings = ratingsSummary && ratingsSummary.trim() !== '';
              
              return (
                <button
                  key={swapSkill.id}
                  onClick={() => {
                    onSwapSkill(skillId, swapSkill.id);
                    setIsSwapMode(false);
                  }}
                  className="w-full text-left p-3 text-sm border border-gray-300 dark:border-gray-600 
                           rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {swapSkill.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 truncate">
                        {swapSkill.description}
                      </div>
                      {hasRatings && (
                        <div className="mt-2 text-xs">
                          {skillRating && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2
                                           ${getRubricLevelColor(skillRating)} bg-gray-100 dark:bg-gray-600`}>
                              Your rating: {getRubricLevelText(skillRating)}
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-gray-400">
                            📊 Has ratings
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface SkillRubricCardProps {
  skillData: IdentifiedSkillData;
  currentRatingForActiveRater?: RubricLevel;
  onRateSkill: (skillId: string, rating: RubricLevel) => void;
  disabled?: boolean;
  allRatingsSummary?: string;
  // Skill Mastery Props
  skillStatus?: SkillStatus;
  masteryCheck?: SkillMasteryCheck;
  onMarkSkillAsMastered?: (skillId: string) => void;
  onSwapSkill?: (removeSkillId: string, addSkillId: string) => void;
  getAvailableSkillsForSwap?: () => IdentifiedSkillData[];
  // Rating access functions for swap dropdown
  getRatingForSkill?: (skillId: string) => RubricLevel | undefined;
  getAllRatingsSummaryForSkill?: (skillId: string) => string;
}

const SkillRubricCard = React.forwardRef<HTMLDivElement, SkillRubricCardProps>(({ 
  skillData, 
  currentRatingForActiveRater, 
  onRateSkill, 
  disabled,
  allRatingsSummary,
  skillStatus,
  masteryCheck,
  onMarkSkillAsMastered,
  onSwapSkill,
  getAvailableSkillsForSwap,
  getRatingForSkill,
  getAllRatingsSummaryForSkill
}, ref) => {
  const { id, name, category, rubric } = skillData;

  return (
    <div ref={ref} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
            {skillStatus && (
              <SkillMasteryIndicator 
                skillId={id} 
                skillStatuses={{ [id]: skillStatus }} 
                size="md" 
              />
            )}
            {masteryCheck?.canBeMastered && skillStatus !== SkillStatus.MASTERED && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                             bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                ✓ Ready for Mastery
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {skillData.isUniversalEnabler && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                🎯 Universal Enabler
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{category}</p>

          {/* Mastery Section - Only if mastery check is available */}
          {masteryCheck && onMarkSkillAsMastered && (
            <div className="my-4">
              {masteryCheck.canBeMastered ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                   bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                      ✓ Ready for Mastery
                    </span>
                  </div>
                  <button
                    onClick={() => onMarkSkillAsMastered(id)}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-md 
                             hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Mark as Mastered
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                   bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                      Need: Self + 3 others at Advanced/Expert
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Self: {masteryCheck.ratingsSummary.selfRating ? (
                      <span className={getRubricLevelColor(masteryCheck.ratingsSummary.selfRating)}>
                        {getRubricLevelText(masteryCheck.ratingsSummary.selfRating)}
                      </span>
                    ) : "Not rated"} | 
                    Others: {masteryCheck.ratingsSummary.otherRatings.length} rated, {
                      masteryCheck.ratingsSummary.otherRatings.filter(r => 
                        r.rating === RubricLevel.ADVANCED || r.rating === RubricLevel.EXPERT
                      ).length
                    } at Advanced/Expert
                  </div>
                </div>
              )}
            </div>
          )}
        <div className="space-y-3 mb-4">
          {(Object.keys(rubric) as Array<keyof typeof rubric>).filter(key => key !== 'skillId').map((levelKey) => {
            const level = Object.values(RubricLevel).find(val => val.toLowerCase() === levelKey.toLowerCase()) as RubricLevel | undefined;
            
            if (!level || !RUBRIC_LEVELS_ORDERED.includes(level)) {
                return null; 
            }
            const description = rubric[levelKey as keyof Omit<Rubric, 'skillId'>];
            const isSelected = currentRatingForActiveRater === level;

            return (
              <button
                key={level}
                onClick={() => !disabled && onRateSkill(id, level)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={`w-full text-left p-3 rounded-md border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
                  ${isSelected 
                    ? 'bg-primary-50 dark:bg-primary-700 dark:bg-opacity-30 border-primary-500 dark:border-primary-400 ring-1 ring-primary-500 dark:ring-primary-400' 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-primary-300 dark:focus:ring-primary-600'}
                  ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex justify-between items-center">
                  <p className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>{level}</p>
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isSelected ? 'text-primary-600 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}>
                  {description}
                </p>
              </button>
            );
          })}
        </div>
      </div>



      <div className="">
        {allRatingsSummary && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium text-gray-700 dark:text-gray-300">All recorded ratings:</p>
                <p>{allRatingsSummary}</p>
            </div>
        )}
        {/* Rating buttons previously here are now removed as per user request */}
      </div>

            {/* Skill Management Section - Always Available */}
      {onSwapSkill && getAvailableSkillsForSwap && skillStatus !== SkillStatus.MASTERED && (
        <div className="mt-4 space-y-3">
          
          {/* Free Skill Swapping - Always Available */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  🔄 Skill Management
                </span>
              </div>
              <MasterySwapButton 
                skillId={id}
                skillName={name}
                onSwapSkill={onSwapSkill}
                getAvailableSkillsForSwap={getAvailableSkillsForSwap}
                getRatingForSkill={getRatingForSkill}
                getAllRatingsSummaryForSkill={getAllRatingsSummaryForSkill}
              />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Swap this skill with any other from your skill bank
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default SkillRubricCard;
