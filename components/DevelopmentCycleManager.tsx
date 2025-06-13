import React, { useState } from 'react';
import { 
  DevelopmentCycle, 
  DevelopmentGoal, 
  CycleStatus 
} from '../types';
import { 
  DEVELOPMENT_CYCLE_CONFIG,
  GROWTH_DIMENSION_DESCRIPTIONS
} from '../constants';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import CycleOverview from './CycleOverview';

interface DevelopmentCycleManagerProps {
  activeCycle: DevelopmentCycle | null;
  goals: DevelopmentGoal[];
  onCreateCycle: (cycle: Omit<DevelopmentCycle, 'id' | 'createdDate'>) => void;
  onCreateGoal: (goal: Omit<DevelopmentGoal, 'id' | 'createdDate' | 'lastUpdated' | 'progress' | 'actions'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<DevelopmentGoal>) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateCycle?: (updates: Partial<DevelopmentCycle>) => void;
  theme: 'light' | 'dark';
  skillNames: Record<string, string>; // skillId -> skill name mapping
}

const DevelopmentCycleManager: React.FC<DevelopmentCycleManagerProps> = ({
  activeCycle,
  goals,
  onCreateCycle,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onUpdateCycle,
  theme,
  skillNames
}) => {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [cycleFormData, setCycleFormData] = useState({
    title: '',
    description: '',
    duration: 3 // months
  });

  const activeGoals = goals.filter(goal => 
    activeCycle && activeCycle.goals.includes(goal.id)
  );

  const handleCreateCycle = () => {
    if (!cycleFormData.title.trim()) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + cycleFormData.duration);

    onCreateCycle({
      title: cycleFormData.title,
      description: cycleFormData.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: CycleStatus.PLANNING,
      goals: [],
      feedbackSummary: undefined,
      reflectionSummary: undefined,
      closedDate: undefined
    });

    setCycleFormData({ title: '', description: '', duration: 3 });
    setShowCreateCycle(false);
  };

  const generateCycleTitle = () => {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear();
    return `Q${quarter} ${year} Development Cycle`;
  };

  if (!activeCycle) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Start Your Development Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create a development cycle to set goals, track progress, and align your growth with the 
            four key dimensions: Breadth, Depth, Reach, and Range.
          </p>

          {!showCreateCycle ? (
            <button
              onClick={() => {
                setCycleFormData({
                  title: generateCycleTitle(),
                  description: '',
                  duration: 3
                });
                setShowCreateCycle(true);
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            >
              🚀 Start New Development Cycle
            </button>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cycle Title
                </label>
                <input
                  type="text"
                  value={cycleFormData.title}
                  onChange={(e) => setCycleFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Q3 2025 Development Cycle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={cycleFormData.description}
                  onChange={(e) => setCycleFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Describe your focus for this development cycle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={cycleFormData.duration}
                  onChange={(e) => setCycleFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {DEVELOPMENT_CYCLE_CONFIG.CYCLE_TEMPLATES.filter(t => t.months > 0).map(template => (
                    <option key={template.months} value={template.months}>
                      {template.name} ({template.months} months)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateCycle}
                  disabled={!cycleFormData.title.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 
                           disabled:cursor-not-allowed"
                >
                  Create Cycle
                </button>
                <button
                  onClick={() => setShowCreateCycle(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 
                           dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Overview */}
      <CycleOverview 
        cycle={activeCycle}
        goals={activeGoals}
        onUpdateCycle={(updates: Partial<DevelopmentCycle>) => {
          if (onUpdateCycle) {
            onUpdateCycle(updates);
          }
        }}
      />

      {/* Goal Section - SIMPLIFIED: One Goal Per Cycle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Development Goal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeGoals.length > 0 ? "Focus on one goal at a time for maximum impact" : "Set your primary development goal for this cycle"}
            </p>
          </div>
          {activeGoals.length === 0 && (
            <button
              onClick={() => setShowCreateGoal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2"
            >
              <span>+</span>
              Set Goal
            </button>
          )}
        </div>

        {/* Single Goal Display */}
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                skillNames={skillNames}
                onUpdate={(updates: Partial<DevelopmentGoal>) => onUpdateGoal(goal.id, updates)}
                onDelete={() => onDeleteGoal(goal.id)}
              />
            ))}
            {/* Option to complete current goal and add new one */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Complete your current goal before adding a new one for maximum focus.
              </p>
              <button
                onClick={() => setShowCreateGoal(true)}
                disabled={activeGoals.some(g => g.progress < 100)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>✓</span>
                {activeGoals.some(g => g.progress >= 100) ? "Add Next Goal" : "Complete Current Goal First"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No goal set for this cycle yet.</p>
            <p className="text-sm mt-1">Set your primary development goal to get started!</p>
          </div>
        )}
      </div>

      {/* Growth Dimensions Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h4 className="text-md font-semibold text-blue-900 dark:text-blue-200 mb-4">
          💡 Growth Dimensions Guide
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(GROWTH_DIMENSION_DESCRIPTIONS).map(([key, info]) => (
            <div key={key} className="flex items-start gap-3">
              <span className="text-lg">{info.icon}</span>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-300">{info.title}</h5>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">{info.description}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">
                  Examples: {info.examples.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <CreateGoalModal
          onCreateGoal={(goalData: Omit<DevelopmentGoal, 'id' | 'createdDate' | 'lastUpdated' | 'progress' | 'actions'>) => {
            onCreateGoal(goalData);
            setShowCreateGoal(false);
          }}
          onClose={() => setShowCreateGoal(false)}
          skillNames={skillNames}
          theme={theme}
        />
      )}
    </div>
  );
};

export default DevelopmentCycleManager;
