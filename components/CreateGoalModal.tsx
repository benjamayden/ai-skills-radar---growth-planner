import React, { useState } from 'react';
import { 
  DevelopmentGoal, 
  GoalType, 
  GrowthDimension, 
  CompanyValue, 
  GoalStatus 
} from '../types';
import { 
  GOAL_TYPE_CONFIG, 
  GROWTH_DIMENSION_DESCRIPTIONS,
  COMPANY_VALUES_DESCRIPTIONS 
} from '../constants';

interface CreateGoalModalProps {
  onCreateGoal: (goal: Omit<DevelopmentGoal, 'id' | 'createdDate' | 'lastUpdated' | 'progress' | 'actions'>) => void;
  onClose: () => void;
  skillNames: Record<string, string>;
  theme: 'light' | 'dark';
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  onCreateGoal,
  onClose,
  skillNames,
  theme // Reserved for future theming enhancements
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalType: GoalType.SKILL_DEVELOPMENT,
    growthDimensions: [] as GrowthDimension[],
    companyValues: [] as CompanyValue[],
    successMetrics: '',
    targetCompletionDate: '',
    relatedSkillIds: [] as string[],
    status: GoalStatus.NOT_STARTED
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    
    if (formData.growthDimensions.length === 0) {
      newErrors.growthDimensions = 'At least one growth dimension must be selected';
    }
    
    if (!formData.successMetrics.trim()) {
      newErrors.successMetrics = 'Success metrics are required';
    }
    
    if (!formData.targetCompletionDate) {
      newErrors.targetCompletionDate = 'Target completion date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onCreateGoal({
      title: formData.title.trim(),
      description: formData.description.trim(),
      goalType: formData.goalType,
      growthDimensions: formData.growthDimensions,
      companyValues: formData.companyValues.length > 0 ? formData.companyValues : undefined,
      successMetrics: formData.successMetrics.trim(),
      targetCompletionDate: formData.targetCompletionDate,
      status: formData.status,
      relatedSkillIds: formData.relatedSkillIds.length > 0 ? formData.relatedSkillIds : undefined,
      reflection: undefined
    });
  };

  const toggleGrowthDimension = (dimension: GrowthDimension) => {
    setFormData(prev => ({
      ...prev,
      growthDimensions: prev.growthDimensions.includes(dimension)
        ? prev.growthDimensions.filter(d => d !== dimension)
        : [...prev.growthDimensions, dimension]
    }));
  };

  const toggleCompanyValue = (value: CompanyValue) => {
    setFormData(prev => ({
      ...prev,
      companyValues: prev.companyValues.includes(value)
        ? prev.companyValues.filter(v => v !== value)
        : [...prev.companyValues, value]
    }));
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedSkillIds: prev.relatedSkillIds.includes(skillId)
        ? prev.relatedSkillIds.filter(id => id !== skillId)
        : [...prev.relatedSkillIds, skillId]
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Development Goal
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                          focus:ring-primary-500 ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="e.g., Master React Advanced Patterns"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(GOAL_TYPE_CONFIG).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, goalType: type as GoalType }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.goalType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{config.icon}</span>
                      <span className="font-medium text-sm">{type}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{config.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Describe what you want to achieve and why it's important..."
              />
            </div>

            {/* Growth Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Growth Dimensions * <span className="text-xs text-gray-500">(Select at least one)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(GROWTH_DIMENSION_DESCRIPTIONS).map(([dimension, info]) => (
                  <button
                    key={dimension}
                    type="button"
                    onClick={() => toggleGrowthDimension(dimension as GrowthDimension)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.growthDimensions.includes(dimension as GrowthDimension)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{info.icon}</span>
                      <span className="font-medium text-sm">{info.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
                  </button>
                ))}
              </div>
              {errors.growthDimensions && (
                <p className="text-red-500 text-sm mt-1">{errors.growthDimensions}</p>
              )}
            </div>

            {/* Company Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Values Alignment <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(COMPANY_VALUES_DESCRIPTIONS).map(([value, info]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleCompanyValue(value as CompanyValue)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.companyValues.includes(value as CompanyValue)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{value}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Success Metrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Success Metrics *
              </label>
              <textarea
                value={formData.successMetrics}
                onChange={(e) => setFormData(prev => ({ ...prev, successMetrics: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                          focus:ring-primary-500 ${errors.successMetrics ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                rows={2}
                placeholder="How will you measure success? e.g., Complete certification, deliver project, receive positive feedback..."
              />
              {errors.successMetrics && (
                <p className="text-red-500 text-sm mt-1">{errors.successMetrics}</p>
              )}
            </div>

            {/* Target Completion Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Completion Date *
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                min={getMinDate()}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                          focus:ring-primary-500 ${errors.targetCompletionDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.targetCompletionDate && (
                <p className="text-red-500 text-sm mt-1">{errors.targetCompletionDate}</p>
              )}
            </div>

            {/* Related Skills */}
            {Object.keys(skillNames).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related Skills <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  <div className="space-y-1">
                    {Object.entries(skillNames).map(([skillId, skillName]) => (
                      <label key={skillId} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.relatedSkillIds.includes(skillId)}
                          onChange={() => toggleSkill(skillId)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{skillName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 
                         dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;
