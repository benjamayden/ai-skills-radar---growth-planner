
import React from 'react';
import { IdentifiedSkillData, RubricLevel, RUBRIC_LEVELS_ORDERED, Rubric } from '../types';

interface SkillRubricCardProps {
  skillData: IdentifiedSkillData;
  currentRatingForActiveRater?: RubricLevel;
  onRateSkill: (skillId: string, rating: RubricLevel) => void;
  disabled?: boolean;
  allRatingsSummary?: string;
}

// Wrapped with React.forwardRef
const SkillRubricCard = React.forwardRef<HTMLDivElement, SkillRubricCardProps>(({ 
  skillData, 
  currentRatingForActiveRater, 
  onRateSkill, 
  disabled,
  allRatingsSummary 
}, ref) => {
  const { id, name, category, rubric } = skillData;

  return (
    // Attached the ref to the main div
    <div ref={ref} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{category}</p>

        <div className="space-y-3 mb-4">
          {(Object.keys(rubric) as Array<keyof typeof rubric>).filter(key => key !== 'skillId').map((levelKey) => {
            const level = Object.values(RubricLevel).find(val => val.toLowerCase() === levelKey.toLowerCase()) as RubricLevel | undefined;
            
            if (!level || !RUBRIC_LEVELS_ORDERED.includes(level)) {
                return null; 
            }
            const description = rubric[levelKey as keyof Omit<Rubric, 'skillId'>];

            return (
              <div key={level} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="font-medium text-gray-700 dark:text-gray-200">{level}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
              </div>
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
        <div className="print-hide"> {/* Added print-hide to this container */}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate proficiency (for active rater):</p>
          <div className="flex flex-wrap gap-2">
            {RUBRIC_LEVELS_ORDERED.map((level) => (
              <button
                key={level}
                onClick={() => onRateSkill(id, level)}
                disabled={disabled}
                className={`px-4 py-2 text-sm rounded-md border transition-colors
                  ${currentRatingForActiveRater === level 
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                    : 'bg-white text-primary-700 border-primary-300 hover:bg-primary-100 dark:bg-gray-600 dark:text-primary-300 dark:border-gray-500 dark:hover:bg-gray-500'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}  
                `}
                aria-pressed={currentRatingForActiveRater === level}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SkillRubricCard;
