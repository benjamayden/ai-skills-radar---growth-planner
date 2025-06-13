import React from "react";
import { SkillStatus, SkillLevel } from "../types";

interface SkillMasteryIndicatorProps {
  skillId: string;
  skillStatuses?: Record<string, SkillStatus>;
  skillName?: string;
  currentLevel?: SkillLevel;
  targetLevel?: SkillLevel;
  isSelected?: boolean;
  showTarget?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  theme?: 'light' | 'dark';
  mode?: 'simple' | 'detailed';
}

const SkillMasteryIndicator: React.FC<SkillMasteryIndicatorProps> = ({
  skillId,
  skillStatuses,
  skillName,
  currentLevel,
  targetLevel,
  isSelected = false,
  showTarget = true,
  size = "sm",
  className = "",
  theme = 'light',
  mode = 'simple'
}) => {
  // Legacy mode for backward compatibility
  if (mode === 'simple' && skillStatuses) {
    const status = skillStatuses[skillId];
    
    if (status !== SkillStatus.MASTERED) {
      return null;
    }

    const sizeClasses = {
      sm: "w-3 h-3 text-xs",
      md: "w-4 h-4 text-sm", 
      lg: "w-5 h-5 text-base"
    };

    return (
      <div 
        className={`${sizeClasses[size]} inline-flex items-center justify-center 
                    bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 
                    rounded-full border border-green-300 dark:border-green-600 
                    font-bold ${className}`}
        title="Mastered Skill"
      >
        ✓
      </div>
    );
  }

  // Detailed mode for development cycles
  if (mode === 'detailed' && currentLevel && skillName) {
    const getLevelNumber = (level: SkillLevel): number => {
      switch (level) {
        case SkillLevel.LEARNING:
          return 1;
        case SkillLevel.PRACTICING:
          return 2;
        case SkillLevel.APPLYING:
          return 3;
        case SkillLevel.LEADING:
          return 4;
        default:
          return 0;
      }
    };

    const getLevelColor = (level: SkillLevel): string => {
      switch (level) {
        case SkillLevel.LEARNING:
          return 'bg-red-500';
        case SkillLevel.PRACTICING:
          return 'bg-yellow-500';
        case SkillLevel.APPLYING:
          return 'bg-blue-500';
        case SkillLevel.LEADING:
          return 'bg-green-500';
        default:
          return 'bg-gray-300 dark:bg-gray-600';
      }
    };

    const getLevelIcon = (level: SkillLevel): string => {
      switch (level) {
        case SkillLevel.LEARNING:
          return '🌱';
        case SkillLevel.PRACTICING:
          return '🔨';
        case SkillLevel.APPLYING:
          return '🚀';
        case SkillLevel.LEADING:
          return '⭐';
        default:
          return '❓';
      }
    };

    const currentLevelNumber = getLevelNumber(currentLevel);
    const targetLevelNumber = targetLevel ? getLevelNumber(targetLevel) : null;
    const hasGrowthPotential = targetLevelNumber && targetLevelNumber > currentLevelNumber;

    return (
      <div className={`rounded-lg p-3 transition-all duration-200 ${
        isSelected 
          ? 'bg-primary-50 border-2 border-primary-500 dark:bg-primary-900/20 dark:border-primary-400' 
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
      } ${className}`}>
        {/* Skill Name */}
        <div className="flex items-center justify-between mb-3">
          <h6 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {skillName}
          </h6>
          
          {hasGrowthPotential && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                           bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Growth Target
            </span>
          )}
        </div>

        {/* Current Level Display */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getLevelIcon(currentLevel)}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current: {currentLevel}
            </span>
          </div>
          
          {/* Progress Bar for Current Level */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  level <= currentLevelNumber 
                    ? getLevelColor(currentLevel)
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Target Level Display */}
        {showTarget && targetLevel && targetLevel !== currentLevel && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getLevelIcon(targetLevel)}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Target: {targetLevel}
              </span>
            </div>
            
            {/* Progress Bar for Target Level */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    level <= currentLevelNumber 
                      ? getLevelColor(currentLevel)
                      : level <= targetLevelNumber!
                        ? `${getLevelColor(targetLevel)} opacity-50 border-2 border-dashed border-gray-400`
                        : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {/* Growth Arrow */}
            <div className="flex items-center justify-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentLevelNumber} → {targetLevelNumber} 
                <span className="ml-1">📈</span>
              </span>
            </div>
          </div>
        )}

        {/* Skill Metadata */}
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Skill ID: {skillId.slice(-6)}</span>
            
            {hasGrowthPotential && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                +{targetLevelNumber! - currentLevelNumber} level{targetLevelNumber! - currentLevelNumber > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkillMasteryIndicator;
