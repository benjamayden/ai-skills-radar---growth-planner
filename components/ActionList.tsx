import React, { useState } from 'react';
import { DevelopmentAction, ActionStatus, ResourceType } from '../types';

interface ActionListProps {
  actions: DevelopmentAction[];
  goalId: string;
  onUpdateAction: (actionId: string, updates: Partial<DevelopmentAction>) => void;
  onAddAction: (action: DevelopmentAction) => void;
  onDeleteAction: (actionId: string) => void;
  theme: 'light' | 'dark';
}

const ActionList: React.FC<ActionListProps> = ({
  actions,
  goalId,
  onUpdateAction,
  onAddAction,
  onDeleteAction,
  theme // Reserved for future theming enhancements
}) => {
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    resourceLinks: []
  });

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.TO_DO:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case ActionStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ActionStatus.DONE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.TO_DO:
        return '⭕';
      case ActionStatus.IN_PROGRESS:
        return '🚧';
      case ActionStatus.DONE:
        return '✅';
      default:
        return '⭕';
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.TRAINING_COURSE:
        return '🎓';
      case ResourceType.DOCUMENTATION:
        return '📚';
      case ResourceType.PROJECT_BOARD:
        return '📋';
      case ResourceType.MENTORSHIP:
        return '👥';
      case ResourceType.BOOK:
        return '📖';
      case ResourceType.ARTICLE:
        return '📄';
      case ResourceType.VIDEO:
        return '🎥';
      case ResourceType.CERTIFICATION:
        return '🏆';
      case ResourceType.CONFERENCE:
        return '🎤';
      case ResourceType.OTHER:
        return '🔗';
      default:
        return '🔗';
    }
  };

  const handleAddAction = () => {
    if (!newAction.title.trim()) return;

    const action: DevelopmentAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId,
      title: newAction.title.trim(),
      description: newAction.description.trim() || '',
      status: ActionStatus.TO_DO,
      resourceLinks: newAction.resourceLinks
    };

    onAddAction(action);
    setNewAction({ title: '', description: '', resourceLinks: [] });
    setShowAddAction(false);
  };

  const handleStatusChange = (actionId: string, newStatus: ActionStatus) => {
    const updates: Partial<DevelopmentAction> = { status: newStatus };
    
    if (newStatus === ActionStatus.DONE) {
      updates.completedDate = new Date().toISOString();
    } else {
      updates.completedDate = undefined;
    }

    onUpdateAction(actionId, updates);
  };

  const completedActions = actions.filter(action => action.status === ActionStatus.DONE).length;
  const totalActions = actions.length;
  const progressPercentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h6 className="font-medium text-gray-900 dark:text-white">
            Actions Progress
          </h6>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{completedActions}/{totalActions} completed</span>
            <span>({progressPercentage}%)</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddAction(!showAddAction)}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 
                   dark:hover:text-primary-300 flex items-center gap-1"
        >
          <span>+</span>
          Add Action
        </button>
      </div>

      {/* Progress Bar */}
      {totalActions > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Add Action Form */}
      {showAddAction && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={newAction.title}
                onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Action title (e.g., Complete React Advanced Course)"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <textarea
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description or notes..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddAction}
                disabled={!newAction.title.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 
                         disabled:cursor-not-allowed"
              >
                Add Action
              </button>
              <button
                onClick={() => {
                  setShowAddAction(false);
                  setNewAction({ title: '', description: '', resourceLinks: [] });
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 
                         dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      {actions.length > 0 ? (
        <div className="space-y-3">
          {actions.map(action => (
            <div 
              key={action.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => {
                      const nextStatus = action.status === ActionStatus.TO_DO 
                        ? ActionStatus.IN_PROGRESS
                        : action.status === ActionStatus.IN_PROGRESS
                          ? ActionStatus.DONE
                          : ActionStatus.TO_DO;
                      handleStatusChange(action.id, nextStatus);
                    }}
                    className="mt-1 text-lg hover:scale-110 transition-transform"
                    title={`Current: ${action.status}. Click to change.`}
                  >
                    {getStatusIcon(action.status)}
                  </button>
                  
                  <div className="flex-1">
                    <h6 className={`font-medium text-sm ${
                      action.status === ActionStatus.DONE 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {action.title}
                    </h6>
                    
                    {action.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                    )}

                    {action.completedDate && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Completed on {new Date(action.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                    {action.status}
                  </span>
                  
                  <button
                    onClick={() => onDeleteAction(action.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    title="Delete action"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Resource Links */}
              {action.resourceLinks && action.resourceLinks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {action.resourceLinks.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs 
                                 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 
                                 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        <span>{getResourceIcon(resource.type)}</span>
                        <span>{resource.title}</span>
                        <span>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Status Change */}
              <div className="mt-3 flex gap-2">
                {Object.values(ActionStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(action.id, status)}
                    disabled={action.status === status}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      action.status === status
                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {getStatusIcon(status)} {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No actions defined yet.</p>
          <p className="text-xs">Break down this goal into actionable steps.</p>
        </div>
      )}
    </div>
  );
};

export default ActionList;
