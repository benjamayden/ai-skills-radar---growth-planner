import React, { useState, useMemo } from 'react';
import { SkillCandidate, SkillSelectionState } from '../types';
import { SKILL_SELECTION_CONFIG } from '../constants';

interface SkillSelectionInterfaceProps {
  skillSelection: SkillSelectionState;
  onSelectionChange: (selectedPersonalSkillIds: string[]) => void;
  onComplete: (selectedPersonalSkillIds: string[]) => void;
  loading?: boolean;
}

const SkillSelectionInterface: React.FC<SkillSelectionInterfaceProps> = ({
  skillSelection,
  onSelectionChange,
  onComplete,
  loading = false
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    skillSelection.selectedPersonalSkills
  );

  const sortedCandidates = useMemo(() => {
    // Filter out universal enabler skills from candidates since they're already shown separately
    const universalEnablerIds = skillSelection.universalEnablers.map(skill => skill.id);
    const personalSkillCandidates = skillSelection.candidates.filter(
      candidate => !universalEnablerIds.includes(candidate.id)
    );
    return personalSkillCandidates.sort((a, b) => a.overallRank - b.overallRank);
  }, [skillSelection.candidates, skillSelection.universalEnablers]);

  const handleSkillToggle = (skillId: string) => {
    if (loading) return;

    const newSelection = selectedSkills.includes(skillId)
      ? selectedSkills.filter(id => id !== skillId)
      : selectedSkills.length < skillSelection.maxPersonalSkills
        ? [...selectedSkills, skillId]
        : selectedSkills;

    setSelectedSkills(newSelection);
    onSelectionChange(newSelection);
  };

  const handleComplete = () => {
    if (selectedSkills.length === 0) return;
    onComplete(selectedSkills);
  };

  const canSelectMore = selectedSkills.length < skillSelection.maxPersonalSkills;

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Select Your Personal Skills
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose {skillSelection.maxPersonalSkills} skills that best match your goals and development needs. 
          The Universal Growth Enablers are automatically included.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selected: {selectedSkills.length}/{skillSelection.maxPersonalSkills} personal skills
          </p>
          <button
            onClick={handleComplete}
            disabled={selectedSkills.length === 0 || loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Radar
          </button>
        </div>
      </div>

      {/* Universal Enablers Preview */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🎯 Universal Growth Enablers (Automatically Included)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillSelection.universalEnablers.map((skill) => (
            <div
              key={skill.id}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg"
            >
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">
                {skill.name}
              </h4>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {skill.category}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Skills Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Personal Skills (Choose {skillSelection.maxPersonalSkills})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCandidates.map((skill) => {
            const isSelected = selectedSkills.includes(skill.id);
            const canSelect = canSelectMore || isSelected;

            return (
              <div
                key={skill.id}
                className={`p-6 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500 dark:bg-primary-900/20'
                    : canSelect
                      ? 'bg-gray-50 hover:bg-gray-100 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600'
                      : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                }`}
                onClick={() => canSelect && handleSkillToggle(skill.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      isSelected 
                        ? 'text-primary-800 dark:text-primary-300' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {skill.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {skill.category}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {isSelected && (
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Goal Alignment:</span>
                    <p className="text-gray-600 dark:text-gray-400">{skill.goalAlignment}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Market Importance:</span>
                    <p className="text-gray-600 dark:text-gray-400">{skill.marketImportance}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Relevance Score: {skill.relevanceScore}/10
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Rank #{skill.overallRank}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleComplete}
          disabled={selectedSkills.length === 0 || loading}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Continue with Selected Skills ({selectedSkills.length}/{skillSelection.maxPersonalSkills})
        </button>
      </div>
    </div>
  );
};

export default SkillSelectionInterface;
