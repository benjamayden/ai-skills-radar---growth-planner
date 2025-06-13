import React from 'react';
import { DevelopmentCycle, DevelopmentGoal, CycleStatus, GoalStatus } from '../types';

interface CycleOverviewProps {
  cycle: DevelopmentCycle;
  goals: DevelopmentGoal[];
  onUpdateCycle: (updates: Partial<DevelopmentCycle>) => void;
}

const CycleOverview: React.FC<CycleOverviewProps> = ({
  cycle,
  goals,
  onUpdateCycle
}) => {
  const getStatusColor = (status: CycleStatus) => {
    switch (status) {
      case CycleStatus.PLANNING:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case CycleStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case CycleStatus.REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case CycleStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: CycleStatus) => {
    switch (status) {
      case CycleStatus.PLANNING:
        return '📋';
      case CycleStatus.ACTIVE:
        return '🚀';
      case CycleStatus.REVIEW:
        return '🔍';
      case CycleStatus.COMPLETED:
        return '✅';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(cycle.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressData = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.status === GoalStatus.COMPLETED).length;
    const inProgressGoals = goals.filter(goal => goal.status === GoalStatus.IN_PROGRESS).length;
    const notStartedGoals = goals.filter(goal => goal.status === GoalStatus.NOT_STARTED).length;
    
    const overallProgress = totalGoals > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
      : 0;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      notStartedGoals,
      overallProgress
    };
  };

  const progressData = getProgressData();
  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0 && cycle.status !== CycleStatus.COMPLETED;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Cycle Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getStatusIcon(cycle.status)}</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {cycle.title}
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cycle.status)}`}>
              {cycle.status}
            </span>
          </div>
          
          {cycle.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{cycle.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                {isOverdue 
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : daysRemaining === 0 
                    ? 'Due today'
                    : `${daysRemaining} days remaining`
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>{progressData.totalGoals} goals</span>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-3">
          <select
            value={cycle.status}
            onChange={(e) => onUpdateCycle({ status: e.target.value as CycleStatus })}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.values(CycleStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Overall Progress */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{progressData.overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressData.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Goal Status Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Completed</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {progressData.completedGoals}
            </span>
            <span className="text-sm text-gray-500">/ {progressData.totalGoals}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">In Progress</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚧</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {progressData.inProgressGoals}
            </span>
            <span className="text-sm text-gray-500">goals</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Not Started</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭕</span>
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {progressData.notStartedGoals}
            </span>
            <span className="text-sm text-gray-500">goals</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => {
            const feedbackSummary = prompt('Add feedback summary for this cycle:');
            if (feedbackSummary) {
              onUpdateCycle({ feedbackSummary });
            }
          }}
          className="px-4 py-2 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 
                   dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          📝 Add Feedback Summary
        </button>

        <button
          onClick={() => {
            const reflectionSummary = prompt('Add reflection summary for this cycle:');
            if (reflectionSummary) {
              onUpdateCycle({ reflectionSummary });
            }
          }}
          className="px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 
                   dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800"
        >
          🤔 Add Reflection
        </button>

        {cycle.status === CycleStatus.ACTIVE && progressData.completedGoals === progressData.totalGoals && (
          <button
            onClick={() => onUpdateCycle({ 
              status: CycleStatus.REVIEW,
              closedDate: new Date().toISOString()
            })}
            className="px-4 py-2 text-sm bg-green-100 text-green-800 dark:bg-green-900 
                     dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
          >
            🎉 Move to Review
          </button>
        )}
      </div>

      {/* Feedback and Reflection Display */}
      {(cycle.feedbackSummary || cycle.reflectionSummary) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
          {cycle.feedbackSummary && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">📝 Feedback Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 
                          rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                {cycle.feedbackSummary}
              </p>
            </div>
          )}

          {cycle.reflectionSummary && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">🤔 Reflection Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 
                          rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                {cycle.reflectionSummary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleOverview;
