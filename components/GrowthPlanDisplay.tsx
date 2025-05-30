
import React from 'react';
import { GrowthPlan, GroundingChunk } from '../types';

interface GrowthPlanDisplayProps {
  growthPlans: GrowthPlan[];
}

const AttributionLink: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  if (chunk.web && chunk.web.uri && chunk.web.title) {
    return (
      <a
        href={chunk.web.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:underline mr-2 mb-1 inline-block bg-primary-100 dark:bg-primary-700 dark:bg-opacity-50 px-2 py-0.5 rounded"
        title={chunk.web.title}
      >
        Source: {new URL(chunk.web.uri).hostname}
      </a>
    );
  }
  return null;
};

const GrowthPlanDisplay: React.FC<GrowthPlanDisplayProps> = ({ growthPlans }) => {
  if (!growthPlans || growthPlans.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No growth plan data available.</p>;
  }

  return (
    <div className="space-y-8">
      {growthPlans.map((plan, index) => (
        <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-primary-700 dark:text-primary-400 mb-4">Growth Plan: {plan.skillName}</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Understanding Your Current Level</h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{plan.currentProficiencyContext || "Details about your current standing could not be generated."}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Developing Towards Your Goals</h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{plan.targetProficiencyContext || "Details for developing towards your goals could not be generated."}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Learning Resources</h4>
            {plan.learningResources && plan.learningResources.length > 0 ? (
              <ul className="space-y-3">
                {plan.learningResources.map((resource, rIndex) => (
                  <li key={rIndex} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
                    >
                      {resource.title}
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No specific learning resources found.</p>
            )}
          </div>
          
          {plan.searchAttributions && plan.searchAttributions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Powered by Google Search (Attributions):</h5>
              <div className="flex flex-wrap">
                {plan.searchAttributions.map((chunk, cIndex) => (
                  <AttributionLink key={cIndex} chunk={chunk} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GrowthPlanDisplay;
