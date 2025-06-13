import React, { useState } from 'react';
import { DevelopmentGoal, GoalStatus } from '../types';
import { GOAL_TYPE_CONFIG, GROWTH_DIMENSION_DESCRIPTIONS } from '../constants';

interface GoalCardProps {
  goal: DevelopmentGoal;
  skillNames: Record<string, string>;
  onUpdate: (updates: Partial<DevelopmentGoal>) => void;
  onDelete: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  skillNames,
  onUpdate,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case GoalStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case GoalStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case GoalStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case GoalStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(goal.targetCompletionDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0 && goal.status !== GoalStatus.COMPLETED;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 space-y-4">
      {/* Goal Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">{GOAL_TYPE_CONFIG[goal.goalType]?.icon || '📝'}</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h4>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                             bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Overdue
              </span>
            )}
            {isDueSoon && !isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                             bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Due Soon
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
              {goal.status}
            </span>
            <span>Due: {formatDate(goal.targetCompletionDate)}</span>
            <span>{goal.goalType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-600 text-sm"
            title="Delete goal"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Growth Dimensions */}
      <div className="flex flex-wrap gap-2">
        {goal.growthDimensions.map(dimension => (
          <span 
            key={dimension}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                     bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            title={GROWTH_DIMENSION_DESCRIPTIONS[dimension].description}
          >
            {GROWTH_DIMENSION_DESCRIPTIONS[dimension].icon} {dimension}
          </span>
        ))}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {/* Description */}
          {goal.description && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Description</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
            </div>
          )}

          {/* Success Metrics */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Success Metrics</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">{goal.successMetrics}</p>
          </div>

          {/* Related Skills */}
          {goal.relatedSkillIds && goal.relatedSkillIds.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Related Skills</h5>
              <div className="flex flex-wrap gap-2">
                {goal.relatedSkillIds.map(skillId => (
                  <span 
                    key={skillId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                             bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skillNames[skillId] || skillId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Values */}
          {goal.companyValues && goal.companyValues.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Aligned Values</h5>
              <div className="flex flex-wrap gap-2">
                {goal.companyValues.map(value => (
                  <span 
                    key={value}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                             bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SIMPLIFIED: Focus on insights rather than task management */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">
                Progress Insights
              </h5>
            </div>
            
            <div className="space-y-3">
              {/* Progress Update */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px]">
                  Progress:
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => onUpdate({ progress: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[40px]">
                  {goal.progress}%
                </span>
              </div>

              {/* Simple reflection area instead of complex action tracking */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current insights & next steps:
                </label>
                <textarea
                  value={goal.reflection || ''}
                  onChange={(e) => onUpdate({ reflection: e.target.value })}
                  placeholder="What's working? What challenges are you facing? What will you focus on next?"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              {/* Key milestone checkboxes instead of complex actions */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Key milestones achieved:
                </label>
                <div className="space-y-2">
                  {['Started learning/practicing', 'Applied in real situation', 'Received feedback', 'Demonstrated improvement'].map((milestone, index) => (
                    <label key={index} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={goal.progress >= (index + 1) * 25}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onUpdate({ progress: Math.max(goal.progress, (index + 1) * 25) });
                          } else {
                            onUpdate({ progress: Math.min(goal.progress, index * 25) });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{milestone}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Controls */}
          <div className="flex gap-2 pt-2">
            <select
              value={goal.status}
              onChange={(e) => onUpdate({ status: e.target.value as GoalStatus })}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(GoalStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {goal.status === GoalStatus.COMPLETED && (
              <button
                onClick={() => {
                  const newReflection = prompt('Add a reflection note about completing this goal:');
                  if (newReflection) {
                    onUpdate({ reflection: newReflection });
                  }
                }}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 
                         dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
              >
                Add Reflection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCard;
