import React from 'react';
import { IdentifiedSkillData } from '../types';
import { MAX_FOCUS_SKILLS } from '../constants';

interface FocusSkillsSelectorProps {
  skills: IdentifiedSkillData[];
  selectedSkills: string[]; // array of skill IDs
  onSkillToggle: (skillId: string) => void;
  disabled?: boolean;
}

const FocusSkillsSelector: React.FC<FocusSkillsSelectorProps> = ({ skills, selectedSkills, onSkillToggle, disabled }) => {
  const canSelectMore = selectedSkills.length < MAX_FOCUS_SKILLS;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Select Focus Skills for Growth (Up to {MAX_FOCUS_SKILLS})</h3>
      {skills.length === 0 && <p className="text-gray-500 dark:text-gray-400">No skills identified yet.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.id);
          return (
            <button
              key={skill.id}
              onClick={() => onSkillToggle(skill.id)}
              disabled={disabled || (!isSelected && !canSelectMore)}
              className={`p-4 rounded-md border text-left transition-all
                ${isSelected 
                  ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-500 ring-offset-2 dark:bg-primary-500 dark:border-primary-500' 
                  : 'bg-gray-50 hover:bg-primary-100 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200'}
                ${(disabled || (!isSelected && !canSelectMore)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{skill.name}</p>
              <p className={`text-xs ${isSelected ? 'opacity-80 text-gray-200 dark:text-gray-300' : 'opacity-80 text-gray-600 dark:text-gray-400'}`}>{skill.category}</p>
            </button>
          );
        })}
      </div>
      {selectedSkills.length >= MAX_FOCUS_SKILLS && (
        <p className="mt-4 text-sm text-primary-600 dark:text-primary-400">You have selected the maximum of {MAX_FOCUS_SKILLS} focus skills.</p>
      )}
    </div>
  );
};

export default FocusSkillsSelector;
