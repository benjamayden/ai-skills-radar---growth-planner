import React, { useState } from "react";
import { IdentifiedSkillData, SkillMasteryCheck, SkillStatus, RubricLevel } from "../types";

interface SkillMasteryManagerProps {
  skills: IdentifiedSkillData[];
  skillStatuses: Record<string, SkillStatus>;
  onMarkSkillAsMastered: (skillId: string) => void;
  onToggleMasteredSkill: (skillId: string) => void;
  onSwapSkill: (removeSkillId: string, addSkillId: string) => void;
  checkSkillMastery: (skillId: string) => SkillMasteryCheck;
  getAvailableSkillsForSwap: () => IdentifiedSkillData[];
  theme: "light" | "dark";
}

const SkillMasteryManager: React.FC<SkillMasteryManagerProps> = ({
  skills,
  skillStatuses,
  onMarkSkillAsMastered,
  onToggleMasteredSkill,
  onSwapSkill,
  checkSkillMastery,
  getAvailableSkillsForSwap,
}) => {
  const [showMasteredSkills, setShowMasteredSkills] = useState(false);
  const [swapMode, setSwapMode] = useState<string | null>(null);

  const activeSkills = skills.filter(skill => skillStatuses[skill.id] === SkillStatus.ACTIVE);
  const masteredSkills = skills.filter(skill => skillStatuses[skill.id] === SkillStatus.MASTERED);
  const availableSkillsForSwap = getAvailableSkillsForSwap();

  const getMasteryStatus = (skillId: string) => {
    const check = checkSkillMastery(skillId);
    return check;
  };

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Skill Mastery Management
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMasteredSkills(!showMasteredSkills)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                     hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-primary-500"
          >
            {showMasteredSkills ? "Hide" : "Show"} Mastered Skills ({masteredSkills.length})
          </button>
        </div>
      </div>

      {/* Active Skills with Mastery Status */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Active Skills ({activeSkills.length}/12)
        </h4>
        <div className="grid gap-3">
          {activeSkills.map((skill) => {
            const masteryCheck = getMasteryStatus(skill.id);
            const isInSwapMode = swapMode === skill.id;
            
            return (
              <div
                key={skill.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 
                         bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {skill.description}
                    </p>
                    
                    {/* Mastery Status */}
                    <div className="mt-2">
                      {masteryCheck.canBeMastered ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                         bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                            ✓ Ready for Mastery
                          </span>
                          <button
                            onClick={() => onMarkSkillAsMastered(skill.id)}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded-md 
                                     hover:bg-green-700 focus:outline-none focus:ring-2 
                                     focus:ring-green-500"
                          >
                            Mark as Mastered
                          </button>
                          <button
                            onClick={() => setSwapMode(isInSwapMode ? null : skill.id)}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md 
                                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                                     focus:ring-blue-500"
                          >
                            {isInSwapMode ? "Cancel Swap" : "Swap Skill"}
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                           bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                              Need: Self + 3 others at Advanced/Expert
                            </span>
                          </div>
                          <div className="text-xs">
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
                  </div>
                </div>

                {/* Swap Interface */}
                {isInSwapMode && availableSkillsForSwap.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
                    <h6 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Select a skill to swap with:
                    </h6>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableSkillsForSwap.map((swapSkill) => (
                        <button
                          key={swapSkill.id}
                          onClick={() => {
                            onSwapSkill(skill.id, swapSkill.id);
                            setSwapMode(null);
                          }}
                          className="w-full text-left p-2 text-sm border border-blue-300 dark:border-blue-600 
                                   rounded-md bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {swapSkill.name}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">
                            {swapSkill.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastered Skills */}
      {showMasteredSkills && masteredSkills.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Mastered Skills ({masteredSkills.length})
          </h4>
          <div className="grid gap-3">
            {masteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="border border-green-200 dark:border-green-700 rounded-lg p-4 
                         bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {skill.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                     bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                        ✓ Mastered
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleMasteredSkill(skill.id)}
                    disabled={activeSkills.length >= 12}
                    className="text-xs px-3 py-1 border border-green-600 text-green-600 dark:text-green-400 
                             rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 focus:outline-none 
                             focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">💡 Skill Mastery System:</p>
          <ul className="text-xs space-y-1">
            <li>• Skills can be marked as "mastered" when you + 3 others rate them as Advanced/Expert</li>
            <li>• Mastered skills are removed from your active radar but all rating data is preserved</li>
            <li>• You can swap mastered skills with new skills to maintain focus on growth areas</li>
            <li>• Reactivate mastered skills anytime (if under 12 total active skills)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillMasteryManager;
