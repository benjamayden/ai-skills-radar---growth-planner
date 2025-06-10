
import React from 'react';
import { IdentifiedSkillData, RubricLevel, RUBRIC_LEVELS_ORDERED, Rubric, SkillStatus, SkillMasteryCheck } from '../types';
import SkillMasteryIndicator from './SkillMasteryIndicator';

interface SkillRubricCardProps {
  skillData: IdentifiedSkillData;
  currentRatingForActiveRater?: RubricLevel;
  onRateSkill: (skillId: string, rating: RubricLevel) => void;
  disabled?: boolean;
  allRatingsSummary?: string;
  // Skill Mastery Props
  skillStatus?: SkillStatus;
  masteryCheck?: SkillMasteryCheck;
}

const SkillRubricCard = React.forwardRef<HTMLDivElement, SkillRubricCardProps>(({ 
  skillData, 
  currentRatingForActiveRater, 
  onRateSkill, 
  disabled,
  allRatingsSummary,
  skillStatus,
  masteryCheck 
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

      <div className="mt-auto">
        {allRatingsSummary && (
            <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="font-medium text-gray-700 dark:text-gray-300">All recorded ratings:</p>
                <p>{allRatingsSummary}</p>
            </div>
        )}
        {/* Rating buttons previously here are now removed as per user request */}
      </div>
    </div>
  );
});

export default SkillRubricCard;
